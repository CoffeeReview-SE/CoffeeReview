-- Bổ sung dữ liệu phiên và khóa chống đếm trùng cho Analytics Dashboard.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM (VALUES
            ('visit_session', 'session_id', 'uuid'),
            ('visit_session', 'visitor_id', 'uuid'),
            ('visit_session', 'last_activity_at', 'timestamp with time zone'),
            ('visit_session', 'is_admin_session', 'boolean'),
            ('page_view', 'session_id', 'uuid'),
            ('audio_play', 'session_id', 'uuid'),
            ('audio_play', 'brand_id', 'bigint'),
            ('audio_play', 'language_code', 'character varying'),
            ('audio_play', 'played_at', 'timestamp with time zone'),
            ('brand', 'brand_id', 'bigint'),
            ('language', 'language_code', 'character varying')
        ) AS expected(table_name, column_name, data_type)
        LEFT JOIN information_schema.columns actual
          ON actual.table_schema = 'public'
         AND actual.table_name = expected.table_name
         AND actual.column_name = expected.column_name
         AND actual.data_type = expected.data_type
        WHERE actual.column_name IS NULL
    ) THEN
        RAISE EXCEPTION 'Analytics schema differs from inspected schema; inspect before applying migration';
    END IF;
END $$;

ALTER TABLE public.visit_session ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;
ALTER TABLE public.page_view ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE public.audio_play ADD COLUMN IF NOT EXISTS event_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS ux_page_view_event_id
    ON public.page_view(event_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_audio_play_event_id
    ON public.audio_play(event_id);
CREATE INDEX IF NOT EXISTS ix_visit_session_open_activity
    ON public.visit_session(last_activity_at DESC)
    WHERE ended_at IS NULL AND NOT is_admin_session;
CREATE INDEX IF NOT EXISTS ix_audio_play_brand_time
    ON public.audio_play(brand_id, played_at);
CREATE INDEX IF NOT EXISTS ix_audio_play_language_time
    ON public.audio_play(language_code, played_at);
CREATE INDEX IF NOT EXISTS ix_audio_play_session_id
    ON public.audio_play(session_id);

COMMIT;
