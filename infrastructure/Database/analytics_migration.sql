ALTER TABLE public.visit_session ADD COLUMN IF NOT EXISTS visitor_id UUID;
CREATE INDEX IF NOT EXISTS ix_visit_session_visitor_id ON public.visit_session(visitor_id);
CREATE INDEX IF NOT EXISTS ix_page_view_session_id ON public.page_view(session_id);
