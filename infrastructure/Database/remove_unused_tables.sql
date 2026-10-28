-- Xóa 11 bảng tính năng chưa dùng cùng dữ liệu trong đó; sao lưu trước khi chạy.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

DO $$
DECLARE
    fk RECORD;
BEGIN
    FOR fk IN
        SELECT ns.nspname AS schema_name, tab.relname AS table_name, con.conname
        FROM pg_constraint con
        JOIN pg_class tab ON tab.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = tab.relnamespace
        JOIN pg_class referenced ON referenced.oid = con.confrelid
        JOIN pg_namespace ref_ns ON ref_ns.oid = referenced.relnamespace
        JOIN pg_attribute col ON col.attrelid = tab.oid AND col.attnum = con.conkey[1]
        WHERE con.contype = 'f'
          AND ns.nspname = 'public'
          AND ref_ns.nspname = 'public'
          AND referenced.relname = 'user_account'
          AND cardinality(con.conkey) = 1
          AND (
              (tab.relname = 'submission' AND col.attname IN ('created_by', 'processed_by'))
              OR (tab.relname = 'visit_session' AND col.attname = 'user_id')
          )
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I', fk.schema_name, fk.table_name, fk.conname);
    END LOOP;
END $$;

DROP TABLE IF EXISTS
    public.review_report,
    public.review,
    public.menu_item_translation,
    public.menu_item,
    public.branch_translation,
    public.brand_translation,
    public.visitor_location,
    public.admin_audit_log,
    public.user_role,
    public.role,
    public.user_account
RESTRICT;

COMMIT;

SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
