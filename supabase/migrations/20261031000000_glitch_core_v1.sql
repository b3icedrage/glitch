-- Glitch Core v1: durable profiles, follows, posts, media, likes, comments, and saves.
-- Apply with the Supabase SQL Editor or Supabase CLI after reviewing the project backup.
-- This migration does not use or require a service-role key in the browser.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique,
  display_name text not null default 'New creator',
  avatar_url text,
  bio text not null default '',
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_handle_format check (handle ~ '^[a-z0-9_]{3,30}$'),
  constraint profiles_display_name_length check (char_length(display_name) between 1 and 80),
  constraint profiles_bio_length check (char_length(bio) <= 500)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null default '',
  location text,
  visibility text not null default 'public' check (visibility in ('public', 'followers', 'private')),
  comments_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_caption_length check (char_length(caption) <= 5000),
  constraint posts_location_length check (location is null or char_length(location) <= 160)
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  alt_text text,
  position integer not null default 0 check (position >= 0),
  width integer,
  height integer,
  duration_seconds numeric(10,2),
  created_at timestamptz not null default now(),
  constraint post_media_alt_length check (alt_text is null or char_length(alt_text) <= 500),
  constraint post_media_dimensions check (
    (width is null or width > 0) and (height is null or height > 0)
  ),
  constraint post_media_duration check (duration_seconds is null or duration_seconds > 0)
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_body_length check (char_length(body) between 1 and 2000)
);

create table if not exists public.post_saves (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists follows_following_created_idx
  on public.follows (following_id, created_at desc);
create index if not exists posts_author_created_idx
  on public.posts (author_id, created_at desc);
create index if not exists posts_public_created_idx
  on public.posts (created_at desc) where visibility = 'public';
create index if not exists post_media_post_position_idx
  on public.post_media (post_id, position);
create index if not exists post_likes_user_created_idx
  on public.post_likes (user_id, created_at desc);
create index if not exists comments_post_created_idx
  on public.comments (post_id, created_at);
create index if not exists comments_parent_idx
  on public.comments (parent_id);
create index if not exists post_saves_user_created_idx
  on public.post_saves (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

-- Create one public profile for every newly registered Supabase Auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  base_handle text;
  safe_handle text;
  display_label text;
begin
  display_label := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'New creator'
  );
  base_handle := lower(regexp_replace(
    coalesce(
      nullif(new.raw_user_meta_data ->> 'handle', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'creator'
    ),
    '[^a-zA-Z0-9_]+', '_', 'g'
  ));
  base_handle := trim(both '_' from base_handle);
  base_handle := left(coalesce(nullif(base_handle, ''), 'creator'), 21);
  safe_handle := base_handle || '_' || left(replace(new.id::text, '-', ''), 8);

  insert into public.profiles (id, handle, display_name)
  values (new.id, safe_handle, left(display_label, 80))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.post_saves enable row level security;

-- Profiles are discoverable; only the owner can edit their profile.
drop policy if exists "Profiles are readable" on public.profiles;
create policy "Profiles are readable" on public.profiles
for select to anon, authenticated using (true);

drop policy if exists "Users insert their own profile" on public.profiles;
create policy "Users insert their own profile" on public.profiles
for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile" on public.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Follow graph is readable; a signed-in user can only create/remove their own follows.
drop policy if exists "Follows are readable" on public.follows;
create policy "Follows are readable" on public.follows
for select to anon, authenticated using (true);

drop policy if exists "Users follow as themselves" on public.follows;
create policy "Users follow as themselves" on public.follows
for insert to authenticated with check (follower_id = (select auth.uid()));

drop policy if exists "Users unfollow as themselves" on public.follows;
create policy "Users unfollow as themselves" on public.follows
for delete to authenticated using (follower_id = (select auth.uid()));

-- Public posts are visible to everyone; follower-only posts require an accepted follow.
drop policy if exists "Posts visible by audience" on public.posts;
create policy "Posts visible by audience" on public.posts
for select to anon, authenticated using (
  visibility = 'public'
  or author_id = (select auth.uid())
  or (
    visibility = 'followers'
    and exists (
      select 1 from public.follows f
      where f.follower_id = (select auth.uid())
        and f.following_id = posts.author_id
    )
  )
);

drop policy if exists "Users create their own posts" on public.posts;
create policy "Users create their own posts" on public.posts
for insert to authenticated with check (author_id = (select auth.uid()));

drop policy if exists "Users update their own posts" on public.posts;
create policy "Users update their own posts" on public.posts
for update to authenticated using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

drop policy if exists "Users delete their own posts" on public.posts;
create policy "Users delete their own posts" on public.posts
for delete to authenticated using (author_id = (select auth.uid()));

-- Media inherits post visibility and must be stored under the authenticated owner's namespace.
drop policy if exists "Post media visible with post" on public.post_media;
create policy "Post media visible with post" on public.post_media
for select to anon, authenticated using (
  exists (select 1 from public.posts p where p.id = post_media.post_id)
);

drop policy if exists "Users attach media to their own posts" on public.post_media;
create policy "Users attach media to their own posts" on public.post_media
for insert to authenticated with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.posts p
    where p.id = post_media.post_id and p.author_id = (select auth.uid())
  )
);

drop policy if exists "Users update their own post media" on public.post_media;
create policy "Users update their own post media" on public.post_media
for update to authenticated using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.posts p
    where p.id = post_media.post_id and p.author_id = (select auth.uid())
  )
);

drop policy if exists "Users delete their own post media" on public.post_media;
create policy "Users delete their own post media" on public.post_media
for delete to authenticated using (owner_id = (select auth.uid()));

-- Likes can only be created or removed by the signed-in user.
drop policy if exists "Likes visible with post" on public.post_likes;
create policy "Likes visible with post" on public.post_likes
for select to anon, authenticated using (
  exists (select 1 from public.posts p where p.id = post_likes.post_id)
);

drop policy if exists "Users like as themselves" on public.post_likes;
create policy "Users like as themselves" on public.post_likes
for insert to authenticated with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.posts p where p.id = post_likes.post_id)
);

drop policy if exists "Users unlike as themselves" on public.post_likes;
create policy "Users unlike as themselves" on public.post_likes
for delete to authenticated using (user_id = (select auth.uid()));

-- Comments inherit post visibility. Only the author can edit/delete their own comment.
drop policy if exists "Comments visible with post" on public.comments;
create policy "Comments visible with post" on public.comments
for select to anon, authenticated using (
  exists (select 1 from public.posts p where p.id = comments.post_id)
);

drop policy if exists "Users comment as themselves" on public.comments;
create policy "Users comment as themselves" on public.comments
for insert to authenticated with check (
  author_id = (select auth.uid())
  and exists (
    select 1 from public.posts p
    where p.id = comments.post_id and p.comments_enabled = true
  )
  and (
    parent_id is null
    or exists (
      select 1 from public.comments parent
      where parent.id = comments.parent_id and parent.post_id = comments.post_id
    )
  )
);

drop policy if exists "Users update their own comments" on public.comments;
create policy "Users update their own comments" on public.comments
for update to authenticated using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

drop policy if exists "Users delete their own comments" on public.comments;
create policy "Users delete their own comments" on public.comments
for delete to authenticated using (author_id = (select auth.uid()));

-- Saved posts are private to the account that saved them.
drop policy if exists "Users read their own saves" on public.post_saves;
create policy "Users read their own saves" on public.post_saves
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Users save posts as themselves" on public.post_saves;
create policy "Users save posts as themselves" on public.post_saves
for insert to authenticated with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.posts p where p.id = post_saves.post_id)
);

drop policy if exists "Users remove their own saves" on public.post_saves;
create policy "Users remove their own saves" on public.post_saves
for delete to authenticated using (user_id = (select auth.uid()));

grant select on public.profiles, public.follows, public.posts, public.post_media,
  public.post_likes, public.comments to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.posts to authenticated;
grant insert, update, delete on public.post_media to authenticated;
grant insert, delete on public.follows, public.post_likes, public.post_saves to authenticated;
grant select, insert, update, delete on public.post_saves to authenticated;
grant insert, update, delete on public.comments to authenticated;



-- Private media storage. Signed URLs are issued only after the caller can read the
-- matching post_media row, which itself inherits the parent post's visibility.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media',
  'post-media',
  false,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Post media is readable with visible post" on storage.objects;
create policy "Post media is readable with visible post" on storage.objects
for select to authenticated
using (
  bucket_id = 'post-media'
  and exists (
    select 1
    from public.post_media m
    join public.posts p on p.id = m.post_id
    where m.storage_path = storage.objects.name
  )
);

drop policy if exists "Users upload media into their own folder" on storage.objects;
create policy "Users upload media into their own folder" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'post-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users update media in their own folder" on storage.objects;
create policy "Users update media in their own folder" on storage.objects
for update to authenticated
using (
  bucket_id = 'post-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'post-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users delete media in their own folder" on storage.objects;
create policy "Users delete media in their own folder" on storage.objects
for delete to authenticated
using (
  bucket_id = 'post-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
