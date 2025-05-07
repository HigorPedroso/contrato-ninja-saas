
CREATE OR REPLACE FUNCTION public.get_user_notifications(user_id UUID)
RETURNS SETOF notifications
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.notifications
  WHERE user_id = $1
  ORDER BY created_at DESC;
$$;
