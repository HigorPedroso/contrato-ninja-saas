
CREATE OR REPLACE FUNCTION public.check_unread_notifications(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM public.notifications
  WHERE user_id = $1
  AND read = false;
$$;
