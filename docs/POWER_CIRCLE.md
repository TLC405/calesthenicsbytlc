# Power Circle — community likes and notifications

This feature adds **/community** to **I Got The Power** without replacing any existing training, exercise, planner, or coach features.

## Shipped in this branch

- Responsive premium Power Circle with member-authenticated text posts (up to 2,000 characters)
- Latest/top-liked sort, author-only post deletion, optimistic like/unlike
- One like per user per post and database-maintained aggregate counts
- A database trigger that creates a notification **for the message author only**
- Supabase Realtime inbox, notifications bell in the dashboard and community, toast banners
- Exact unread count (not limited to last 30 inbox items), mark one/all as read
- Row Level Security on all new tables and immutable notification metadata
- Explicitly labeled sample-data test drive at **/community?demo=1** (no backend data written)

## Safe launch order

1. Open the Lovable Cloud / Supabase project associated with this website.
2. Apply `supabase/migrations/20261017070000_power_circle_realtime.sql` using your project's normal migration deployment flow. **Do not paste service-role keys into the app or chat.**
3. Confirm that `public.messages`, `public.message_likes`, and `public.notifications` exist; verify that RLS is enabled and all three are in the `supabase_realtime` publication.
4. Only then merge the GitHub pull request into `main`; let the connected Lovable project sync/build and publish its frontend to `https://igothepowa.lovable.app`. GitHub changes and migration files are **not** the same as applying a migration or publishing the Lovable site.
5. Confirm behavior with **two different logged-in member accounts**. Older data is not seeded or changed.

## Acceptance test (two accounts)

1. Sign in as A; publish a training update in Power Circle.
2. Sign in as B (another browser/private session); like A's post.
3. Verify A immediately receives a **new like** toast and one unread notification while B receives no notification.
4. Try liking a second time: the same user/post pair cannot insert another row (unique primary key).
5. Unlike with B: like count decreases, but A's already-created notification remains in the inbox.
6. As A, like A's own post: like count increases; **no self-notification**.
7. Mark a notification read; badge count updates. Mark all read; count is zero.
8. Reload and confirm state is persisted. Test different browsers/tabs and a network reconnect.
9. Try fetching A's notifications with B's access token: RLS must return no rows.
10. Delete A's post; associated likes and notifications cascade away.

## Technical notes

- The live feed currently displays the latest or top **40** posts; older-post pagination and moderation/reporting are subsequent enhancements.
- The dropdown shows 30 recent notifications, with a separate server-side exact unread count.
- Notification deduplication is deliberate: unlike/re-like by the same actor on the same post does not generate repeated notifications.
- Realtime notifications are **in-app only**, not native mobile push, SMS, or email.
- Demo mode uses illustrative local-only posts; it does not prove the live Supabase trigger works.
- Profile names are snapshotted by a trusted database trigger when a post is created, without making member email addresses public.
- The SQL migration has not been applied automatically by pushing these frontend files to GitHub.
