-- Glitch Core v1: persistent social data foundation.
-- Apply with Supabase CLI or the SQL Editor after reviewing the project settings.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  website_url text,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 30),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_]+$')
);
create unique index if not exists profiles_username_lower_unique on public.profiles (lower(username));

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows(following_id, created_at desc);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null default '',
  visibility text not null default 'public' check (visibility in ('public','followers','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists posts_author_created_idx on public.posts(author_id, created_at desc) where deleted_at is null;
create index if not exists posts_feed_created_idx on public.posts(created_at desc) where deleted_at is null;

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image','video')),
  mime_type text,
  width integer,
  height integer,
  duration_seconds numeric(10,2),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique(post_id, position)
);
create index if not exists post_media_post_idx on public.post_media(post_id, position);

create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, post_id)
);
create index if not exists likes_post_idx on public.likes(post_id, created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists comments_post_created_idx on public.comments(post_id, created_at desc) where deleted_at is null;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image','video')),
  caption text not null default '',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint stories_expiry check (expires_at > created_at)
);
create index if not exists stories_active_idx on public.stories(expires_at, created_at desc);

create table if not exists public.story_views (
  story_id uuid not null references public.stories(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key(story_id, viewer_id)
);

create table if not exists public.sparks (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  thumbnail_path text,
  caption text not null default '',
  visibility text not null default 'public' check (visibility in ('public','followers','private')),
  duration_seconds numeric(10,2),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists sparks_feed_idx on public.sparks(created_at desc) where deleted_at is null;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean not null default false,
  title text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key(conversation_id, user_id)
);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id, joined_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '',
  media_path text,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint messages_content check (char_length(body) <= 5000 and (char_length(body) > 0 or media_path is not null))
);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('like','comment','follow','message','mention','story_view','system')),
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_recipient_idx on public.notifications(recipient_id, created_at desc);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('user','post','comment','spark','message')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);
create index if not exists reports_status_created_idx on public.reports(status, created_at);

-- Create a profile for each newly registered auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
begin
  base_username := coalesce(
    nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', ''), '[^A-Za-z0-9_]', '', 'g'), ''),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 12)
  );
  insert into public.profiles(id, username, display_name)
  values (
    new.id,
    left(base_username, 30),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, 'user'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_following(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.follows f
    where f.follower_id = (select auth.uid())
      and f.following_id = target_user
  );
$$;

create or replace function public.can_view_post(target_post uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.posts p
    where p.id = target_post
      and p.deleted_at is null
      and (
        p.author_id = (select auth.uid())
        or p.visibility = 'public'
        or (p.visibility = 'followers' and public.is_following(p.author_id))
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.stories enable row level security;
alter table public.story_views enable row level security;
alter table public.sparks enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

create policy "Profiles are viewable by signed-in users" on public.profiles
for select to authenticated using (true);
create policy "Users update own profile" on public.profiles
for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Follow relationships are visible to signed-in users" on public.follows
for select to authenticated using (true);
create policy "Users follow as themselves" on public.follows
for insert to authenticated with check (follower_id = (select auth.uid()));
create policy "Users unfollow as themselves" on public.follows
for delete to authenticated using (follower_id = (select auth.uid()));

create policy "View accessible posts" on public.posts
for select to authenticated using (
  deleted_at is null and (
    author_id = (select auth.uid())
    or visibility = 'public'
    or (visibility = 'followers' and public.is_following(author_id))
  )
);
create policy "Create own posts" on public.posts
for insert to authenticated with check (author_id = (select auth.uid()));
create policy "Update own posts" on public.posts
for update to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "Delete own posts" on public.posts
for delete to authenticated using (author_id = (select auth.uid()));

create policy "View media for accessible posts" on public.post_media
for select to authenticated using (public.can_view_post(post_id));
create policy "Attach media to own posts" on public.post_media
for insert to authenticated with check (
  owner_id = (select auth.uid())
  and exists (select 1 from public.posts p where p.id = post_id and p.author_id = (select auth.uid()))
);
create policy "Remove own post media" on public.post_media
for delete to authenticated using (owner_id = (select auth.uid()));

create policy "View likes on accessible posts" on public.likes
for select to authenticated using (public.can_view_post(post_id));
create policy "Like as self" on public.likes
for insert to authenticated with check (user_id = (select auth.uid()) and public.can_view_post(post_id));
create policy "Unlike as self" on public.likes
for delete to authenticated using (user_id = (select auth.uid()));

create policy "View comments on accessible posts" on public.comments
for select to authenticated using (deleted_at is null and public.can_view_post(post_id));
create policy "Comment as self" on public.comments
for insert to authenticated with check (author_id = (select auth.uid()) and public.can_view_post(post_id));
create policy "Edit own comments" on public.comments
for update to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "Delete own comments" on public.comments
for delete to authenticated using (author_id = (select auth.uid()));

create policy "View active stories" on public.stories
for select to authenticated using (expires_at > now());
create policy "Create own stories" on public.stories
for insert to authenticated with check (author_id = (select auth.uid()));
create policy "Delete own stories" on public.stories
for delete to authenticated using (author_id = (select auth.uid()));

create policy "View story view counts" on public.story_views
for select to authenticated using (
  exists (select 1 from public.stories s where s.id = story_id and s.author_id = (select auth.uid()))
  or viewer_id = (select auth.uid())
);
create policy "Record own story views" on public.story_views
for insert to authenticated with check (viewer_id = (select auth.uid()));

create policy "View accessible sparks" on public.sparks
for select to authenticated using (
  deleted_at is null and (
    author_id = (select auth.uid())
    or visibility = 'public'
    or (visibility = 'followers' and public.is_following(author_id))
  )
);
create policy "Create own sparks" on public.sparks
for insert to authenticated with check (author_id = (select auth.uid()));
create policy "Update own sparks" on public.sparks
for update to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "Delete own sparks" on public.sparks
for delete to authenticated using (author_id = (select auth.uid()));

create policy "Members view conversations" on public.conversations
for select to authenticated using (
  exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = (select auth.uid()))
);
create policy "Create conversations as self" on public.conversations
for insert to authenticated with check (created_by = (select auth.uid()));
create policy "Members view membership" on public.conversation_members
for select to authenticated using (
  exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = (select auth.uid()))
);
create policy "Conversation creator adds first member" on public.conversation_members
for insert to authenticated with check (
  user_id = (select auth.uid())
  or exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = (select auth.uid()))
);
create policy "Users update own membership read marker" on public.conversation_members
for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Members view messages" on public.messages
for select to authenticated using (
  exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = (select auth.uid()))
);
create policy "Members send messages as self" on public.messages
for insert to authenticated with check (
  sender_id = (select auth.uid())
  and exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = (select auth.uid()))
);
create policy "Senders edit own messages" on public.messages
for update to authenticated using (sender_id = (select auth.uid())) with check (sender_id = (select auth.uid()));
create policy "Senders delete own messages" on public.messages
for delete to authenticated using (sender_id = (select auth.uid()));

create policy "Users view own notifications" on public.notifications
for select to authenticated using (recipient_id = (select auth.uid()));
create policy "Users mark own notifications read" on public.notifications
for update to authenticated using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));

create policy "Users submit reports as themselves" on public.reports
for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "Users view own reports" on public.reports
for select to authenticated using (reporter_id = (select auth.uid()));

-- Public media bucket for published social media. Uploads are restricted to
-- each user's own UUID folder; private message media should use a separate private bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('glitch-media', 'glitch-media', true, 104857600, array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;

create policy "Public can view published Glitch media" on storage.objects
for select using (bucket_id = 'glitch-media');
create policy "Users upload to their own Glitch folder" on storage.objects
for insert to authenticated with check (
  bucket_id = 'glitch-media' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Users update their own Glitch media" on storage.objects
for update to authenticated using (
  bucket_id = 'glitch-media' and (storage.foldername(name))[1] = (select auth.uid())::text
) with check (
  bucket_id = 'glitch-media' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Users delete their own Glitch media" on storage.objects
for delete to authenticated using (
  bucket_id = 'glitch-media' and (storage.foldername(name))[1] = (select auth.uid())::text
);
