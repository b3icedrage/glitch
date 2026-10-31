# Glitch Core v1 — database foundation

This migration establishes the first persistent, multi-user social graph for Glitch.

## Included

- Supabase Auth user → public profile bootstrap trigger.
- Public creator profiles with owner-only profile updates.
- Follow and unfollow relationships.
- Posts with public, followers-only, and private visibility.
- Ordered image/video media metadata per post.
- Likes, threaded comments, and private saved-post collections.
- Row Level Security (RLS) policies for every table and indexes for common feed/profile lookups.

## Apply the migration

1. Open the Supabase project connected to Glitch.
2. Back up the project before changing its schema.
3. Open **SQL Editor → New query**.
4. Paste and run `supabase/migrations/20261031000000_glitch_core_v1.sql`.
5. Open **Table Editor** and confirm the seven tables exist: `profiles`, `follows`, `posts`, `post_media`, `post_likes`, `comments`, and `post_saves`.
6. In **Authentication → Users**, create a test account. Confirm a matching row appears in `public.profiles`.
7. Test with two accounts: account A creates a public post; account B can read it, follow A, like/comment/save it; account B cannot edit A's profile or post.

The migration is safe to re-run for its declared tables, indexes, triggers, and policies. It does not delete existing rows. Review the SQL and take a backup first.

## Storage is a separate setup step

The `post_media.storage_path` field stores an object path, not an uploaded file. Before enabling real uploads, create a private Supabase Storage bucket named `post-media` and add Storage policies that restrict upload, update, and delete to the authenticated user's own folder (first path segment = `auth.uid()`). Serve private media with short-lived signed URLs. Do not make this bucket public or store temporary browser blob URLs in the database.

## Current boundaries

- This migration does not import the demo/localStorage records into the database.
- It does not yet connect React screens to these tables.
- It does not create Storage buckets automatically.
- It does not add realtime chat, Stories, Sparks, Cinema, livestream delivery, moderation queues, or payment entitlements.
- RLS is the security boundary; never put a Supabase service-role key in browser code.

## Next implementation sequence

1. Add a typed Supabase data client using the existing public URL and anon/publishable key.
2. Replace demo-only profile/feed/follow/like/comment/save reads and writes with authenticated database calls.
3. Add private Storage upload flow and signed media URLs.
4. Add integration tests for two-user visibility and ownership.
5. Add realtime chat and notifications after the core data model is verified.
