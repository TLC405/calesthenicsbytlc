-- Prevent public RPC invocation of privileged internal trigger helpers.
-- Authenticated clients can still use the guarded role lookup and AI quota RPC.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.on_message_liked() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prepare_community_message() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_message_like_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.consume_ai_request() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_request() TO authenticated;
-- Database owners and trigger execution are unaffected by revoking web-role RPC privileges.
