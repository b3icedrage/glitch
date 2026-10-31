import type { SupabaseUser } from '../auth/supabaseAuth';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface CreatorProfile {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CorePost {
  id: string;
  author_id: string;
  caption: string;
  location: string | null;
  visibility: 'public' | 'followers' | 'private';
  comments_enabled: boolean;
  created_at: string;
  updated_at: string;
  profiles?: CreatorProfile;
  post_likes?: Array<{ user_id: string }>;
  post_saves?: Array<{ user_id: string }>;
  comments?: Array<{ id: string }>;
  media_url?: string;
  media_urls?: string[];
  post_media?: Array<{
    id: string;
    storage_path: string;
    media_type: 'image' | 'video';
    alt_text: string | null;
    position: number;
  }>;
}

export interface CoreComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  profiles?: Pick<CreatorProfile, 'id' | 'handle' | 'display_name' | 'avatar_url'>;
}

export class GlitchDataError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GlitchDataError';
  }
}

function requireConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new GlitchDataError('Cloud data is not configured. Add the Supabase URL and anon key to the deployment.');
  }
}

async function request<T>(
  path: string,
  accessToken: string,
  options: { method?: string; body?: unknown; prefer?: string } = {}
): Promise<T> {
  requireConfig();
  if (!accessToken) throw new GlitchDataError('Sign in to use Glitch cloud features.');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: options.method || 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });
  const raw = await response.text();
  if (!response.ok) {
    let message = raw || `Cloud request failed (${response.status}).`;
    try {
      const parsed = JSON.parse(raw);
      message = parsed.message || parsed.details || parsed.hint || parsed.error_description || message;
    } catch {
      // Keep the original response text for non-JSON gateway errors.
    }
    throw new GlitchDataError(message, response.status);
  }
  if (response.status === 204 || !raw) return undefined as T;
  return JSON.parse(raw) as T;
}

export async function getMyProfile(user: SupabaseUser, accessToken: string): Promise<CreatorProfile | null> {
  const rows = await request<CreatorProfile[]>(
    `profiles?select=id,handle,display_name,avatar_url,bio,website_url,created_at,updated_at&id=eq.${encodeURIComponent(user.id)}&limit=1`,
    accessToken
  );
  return rows[0] || null;
}

export async function updateMyProfile(
  user: SupabaseUser,
  accessToken: string,
  changes: Pick<Partial<CreatorProfile>, 'handle' | 'display_name' | 'avatar_url' | 'bio' | 'website_url'>
): Promise<CreatorProfile> {
  const rows = await request<CreatorProfile[]>(
    `profiles?id=eq.${encodeURIComponent(user.id)}&select=id,handle,display_name,avatar_url,bio,website_url,created_at,updated_at`,
    accessToken,
    { method: 'PATCH', body: changes, prefer: 'return=representation' }
  );
  if (!rows[0]) throw new GlitchDataError('Your profile could not be updated.');
  return rows[0];
}

export async function getPublicFeed(accessToken: string, viewerId?: string, limit = 30): Promise<CorePost[]> {
  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 100));
  const audienceFilter = viewerId
    ? `&or=(visibility.neq.private,author_id.eq.${encodeURIComponent(viewerId)})`
    : '&visibility=eq.public';
  const rows = await request<CorePost[]>(
    `posts?select=id,author_id,caption,location,visibility,comments_enabled,created_at,updated_at,profiles(id,handle,display_name,avatar_url),post_media(id,storage_path,media_type,alt_text,position),post_likes(user_id),post_saves(user_id),comments(id)${audienceFilter}&order=created_at.desc&limit=${safeLimit}`,
    accessToken
  );
  return Promise.all(rows.map(async (post) => {
    const media = (post.post_media || []).slice().sort((a, b) => a.position - b.position);
    if (media.length === 0) return post;
    try {
      const mediaUrls = await Promise.all(media.map((item) => getSignedMediaUrl(item.storage_path, accessToken)));
      return { ...post, media_url: mediaUrls[0], media_urls: mediaUrls };
    } catch (error) {
      console.warn('Could not resolve post media:', error);
      return post;
    }
  }));
}

export async function createPost(
  authorId: string,
  accessToken: string,
  input: { caption: string; location?: string; visibility?: CorePost['visibility'] }
): Promise<CorePost> {
  const rows = await request<CorePost[]>(
    'posts?select=id,author_id,caption,location,visibility,comments_enabled,created_at,updated_at',
    accessToken,
    {
      method: 'POST',
      body: {
        author_id: authorId,
        caption: input.caption.trim(),
        location: input.location?.trim() || null,
        visibility: input.visibility || 'public',
      },
      prefer: 'return=representation',
    }
  );
  if (!rows[0]) throw new GlitchDataError('The post was not returned after publishing.');
  return rows[0];
}

export async function followCreator(followerId: string, followingId: string, accessToken: string): Promise<void> {
  if (followerId === followingId) throw new GlitchDataError('You cannot follow your own account.');
  await request(
    'follows',
    accessToken,
    { method: 'POST', body: { follower_id: followerId, following_id: followingId }, prefer: 'resolution=ignore-duplicates,return=minimal' }
  );
}

export async function unfollowCreator(followerId: string, followingId: string, accessToken: string): Promise<void> {
  await request(
    `follows?follower_id=eq.${encodeURIComponent(followerId)}&following_id=eq.${encodeURIComponent(followingId)}`,
    accessToken,
    { method: 'DELETE', prefer: 'return=minimal' }
  );
}

export async function setPostLike(postId: string, userId: string, liked: boolean, accessToken: string): Promise<void> {
  if (liked) {
    await request(
      'post_likes',
      accessToken,
      { method: 'POST', body: { post_id: postId, user_id: userId }, prefer: 'resolution=ignore-duplicates,return=minimal' }
    );
  } else {
    await request(
      `post_likes?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(userId)}`,
      accessToken,
      { method: 'DELETE', prefer: 'return=minimal' }
    );
  }
}

export async function addPostComment(
  postId: string,
  authorId: string,
  body: string,
  accessToken: string,
  parentId?: string
): Promise<CoreComment> {
  const text = body.trim();
  if (!text || text.length > 2000) throw new GlitchDataError('Comments must be between 1 and 2,000 characters.');
  const rows = await request<CoreComment[]>(
    'comments?select=id,post_id,author_id,parent_id,body,created_at',
    accessToken,
    {
      method: 'POST',
      body: { post_id: postId, author_id: authorId, body: text, parent_id: parentId || null },
      prefer: 'return=representation',
    }
  );
  if (!rows[0]) throw new GlitchDataError('Your comment could not be saved.');
  return rows[0];
}

export async function getPostComments(postId: string, accessToken: string): Promise<CoreComment[]> {
  return request<CoreComment[]>(
    `comments?select=id,post_id,author_id,parent_id,body,created_at,profiles(id,handle,display_name,avatar_url)&post_id=eq.${encodeURIComponent(postId)}&order=created_at.asc&limit=200`,
    accessToken
  );
}

export async function savePost(postId: string, userId: string, saved: boolean, accessToken: string): Promise<void> {
  if (saved) {
    await request(
      'post_saves',
      accessToken,
      { method: 'POST', body: { post_id: postId, user_id: userId }, prefer: 'resolution=ignore-duplicates,return=minimal' }
    );
  } else {
    await request(
      `post_saves?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(userId)}`,
      accessToken,
      { method: 'DELETE', prefer: 'return=minimal' }
    );
  }
}


export async function getMyFollowIds(userId: string, accessToken: string): Promise<string[]> {
  const rows = await request<Array<{ following_id: string }>>(
    `follows?select=following_id&follower_id=eq.${encodeURIComponent(userId)}`,
    accessToken
  );
  return rows.map((row) => row.following_id);
}

export async function getSignedMediaUrl(storagePath: string, accessToken: string): Promise<string> {
  requireConfig();
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/post-media/${storagePath.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  const raw = await response.text();
  if (!response.ok) throw new GlitchDataError(raw || 'Could not create a signed media URL.', response.status);
  const data = JSON.parse(raw) as { signedURL?: string };
  if (!data.signedURL) throw new GlitchDataError('Storage did not return a signed media URL.');
  return data.signedURL.startsWith('http') ? data.signedURL : `${SUPABASE_URL}${data.signedURL.startsWith('/') ? '' : '/'}${data.signedURL}`;
}

export async function uploadPostMedia(
  postId: string,
  ownerId: string,
  file: File,
  accessToken: string
): Promise<string> {
  requireConfig();
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const maxBytes = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
  if ((!isImage && !isVideo) || file.size > maxBytes) {
    throw new GlitchDataError(isVideo ? 'Videos must be 100 MB or smaller.' : 'Choose an image up to 15 MB or a video up to 100 MB.');
  }
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-100) || 'upload';
  const storagePath = `${ownerId}/${postId}/${crypto.randomUUID()}-${safeName}`;
  const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/post-media/${storagePath.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.type,
      'x-upsert': 'false',
    },
    body: file,
  });
  if (!upload.ok) throw new GlitchDataError(await upload.text() || 'Media upload failed.', upload.status);
  const rows = await request<Array<{ id: string }>>(
    'post_media?select=id',
    accessToken,
    {
      method: 'POST',
      body: {
        post_id: postId,
        owner_id: ownerId,
        storage_path: storagePath,
        media_type: isVideo ? 'video' : 'image',
        alt_text: file.name.slice(0, 500),
        position: 0,
      },
      prefer: 'return=representation',
    }
  );
  if (!rows[0]) throw new GlitchDataError('Media uploaded but its post record was not created.');
  return getSignedMediaUrl(storagePath, accessToken);
}

export async function deletePost(postId: string, accessToken: string): Promise<void> {
  await request(`posts?id=eq.${encodeURIComponent(postId)}`, accessToken, {
    method: 'DELETE',
    prefer: 'return=minimal',
  });
}
