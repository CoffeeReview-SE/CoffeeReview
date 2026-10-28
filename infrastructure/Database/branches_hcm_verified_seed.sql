BEGIN;
SET LOCAL lock_timeout = '5s';
-- BEGIN VERIFIED BRANCH SEED
-- Officially published addresses checked 2026-10-28; sources: branches_hcm_verified.json.
SELECT pg_advisory_xact_lock(824617305);
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM brand WHERE brand_name IN ('Highlands Coffee', 'KATINAT', 'KOI Thé', 'Milano Coffee', 'Phê La', 'Phúc Long', 'Starbucks', 'The Coffee House', 'Trung Nguyên', 'Viva Star Coffee')) <> 10 THEN
        RAISE EXCEPTION 'Seed the ten brands before adding verified branches';
    END IF;
END $$;

WITH verified(brand_name, branch_name, address, phone) AS (
    VALUES
    ('Phúc Long', 'Phúc Long 95 Phan Xích Long', 'Số 95 Phan Xích Long (Khu dân cư Rạch Miễu), Phường Cầu Kiệu, Thành phố Hồ Chí Minh', NULL),
    ('Phúc Long', 'Phúc Long Đoàn Như Hài', 'Số 1 Đoàn Như Hài, Phường Xóm Chiếu, Thành phố Hồ Chí Minh', NULL),
    ('Phúc Long', 'Phúc Long Phạm Ngọc Thạch', '43 Phạm Ngọc Thạch, Phường Xuân Hòa, Thành phố Hồ Chí Minh', NULL),
    ('Highlands Coffee', 'Highlands Coffee 210 Nguyễn Trãi', '210 Nguyễn Trãi, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh', '02871096465'),
    ('Highlands Coffee', 'Highlands Coffee Nguyễn Thị Định', '205 Nguyễn Thị Định, Phường An Phú, Quận 2, Hồ Chí Minh', '02871080205'),
    ('Highlands Coffee', 'Highlands Coffee Trade Center D10', '11 Sư Vạn Hạnh, Phường 12, Quận 10, TP. Hồ Chí Minh', '02871064949'),
    ('Trung Nguyên', 'Trung Nguyên Legend Café 07 Nguyễn Văn Chiêm', '07 Nguyễn Văn Chiêm, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh', NULL),
    ('Trung Nguyên', 'Trung Nguyên Legend Café 80 Đồng Khởi', '80 Đồng Khởi, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh', NULL),
    ('Trung Nguyên', 'Trung Nguyên Legend Café 12 Alexandre De Rhodes', '12 Alexandre De Rhodes, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh', NULL),
    ('KATINAT', 'KATINAT Tăng Nhơn Phú', '02 Tăng Nhơn Phú, Phước Long B, Thủ Đức City, Ho Chi Minh City, Vietnam', '02873091892'),
    ('KATINAT', 'KATINAT D-Joy Nguyễn Lương Bằng', '61 Nguyễn Lương Bằng, Khu đô thị Phú Mỹ Hưng, Tân Phú, District 7, Ho Chi Minh City, Vietnam', '02873019980'),
    ('KATINAT', 'KATINAT Oscar 68A Nguyễn Huệ', '68A Nguyễn Huệ, Bến Nghé, District 1, Ho Chi Minh City, Vietnam', '02873019981'),
    ('KATINAT', 'KATINAT Đại học Hoa Sen', '08 Đường Nguyễn Văn Tráng, Bến Thành, District 1, Ho Chi Minh City, Vietnam', '02873091894'),
    ('KATINAT', 'KATINAT Nơ Trang Long', '101 Đ. Nơ Trang Long, Phường 11, Bình Thạnh, Hồ Chí Minh, Vietnam', '02873091702'),
    ('KOI Thé', 'KOI Thé Crescent Mall', 'GF-54, Crescent Mall, 101 Tôn Dật Tiên, Phường Tân Mỹ, Thành phố Hồ Chí Minh', '02878908988'),
    ('KOI Thé', 'KOI Thé Pasteur', '120 Pasteur, Phường Sài Gòn, Thành phố Hồ Chí Minh', '02873060588'),
    ('KOI Thé', 'KOI Thé Saigon Garden', '108-110 Ho Tung Mau, Ben Nghe Ward, District 1, Ho Chi Minh City', '02838215586'),
    ('Phê La', 'Phê La Hai Bà Trưng', 'Số 125 Hai Bà Trưng, Phường Sài Gòn (Quận 1 cũ), TP HCM', NULL),
    ('Phê La', 'Phê La Trương Định Quận 3', 'Số 115 Trương Định, Quận 3, TP HCM', NULL),
    ('Phê La', 'Phê La Nguyễn Đức Cảnh', 'Số 127 Nguyễn Đức Cảnh - Phú Mỹ Hưng, Phường Tân Hưng (Quận 7 cũ), TP HCM', NULL),
    ('Milano Coffee', 'Milano Coffee 590/2 Phan Văn Trị', '590/2 Phan Văn Trị, Phường 7, Quận Gò Vấp, TP.HCM', NULL),
    ('Viva Star Coffee', 'Viva Star Coffee Lý Thái Tổ', '437 Lý Thái Tổ, P.10, Quận 10, TP. Hồ Chí Minh', NULL),
    ('Viva Star Coffee', 'Viva Star Coffee Lý Thường Kiệt', '354/15 Lý Thường Kiệt, P.14, Quận 10, TP. Hồ Chí Minh', NULL),
    ('Viva Star Coffee', 'Viva Star Coffee Thành Thái', '84 Thành Thái, Quận 10, TP. Hồ Chí Minh', NULL),
    ('The Coffee House', 'The Coffee House Xuân Thủy', '57 Xuân Thủy, Thảo Điền, Quận 2, Thành phố Hồ Chí Minh', NULL),
    ('The Coffee House', 'The Coffee House Huỳnh Văn Bánh', '68 Huỳnh Văn Bánh, Phường 15, Phú Nhuận, Hồ Chí Minh', NULL),
    ('The Coffee House', 'The Coffee House Phan Văn Trị 3', '190 Phan Văn Trị, Phường 11, Bình Thạnh, Thành phố Hồ Chí Minh', NULL),
    ('Starbucks', 'Starbucks New World', 'Góc đường Phạm Hồng Thái và Nguyễn Thị Nghĩa, 76 Lê Lai, Quận 1, TP. Hồ Chí Minh', '02838237952'),
    ('Starbucks', 'Starbucks Phan Xích Long', '214-216 Phan Xích Long, Quận Phú Nhuận, TP. Hồ Chí Minh', '02835176461'),
    ('Starbucks', 'Starbucks Panorama', 'SN-44, Tòa nhà Panorama, 208 Trần Văn Trà, Quận 7, TP. Hồ Chí Minh', '02854138292')
)
INSERT INTO branch(brand_id, branch_name, address, phone)
SELECT b.brand_id, v.branch_name, v.address, v.phone
FROM verified v JOIN brand b ON b.brand_name = v.brand_name
WHERE NOT EXISTS (
    SELECT 1 FROM branch old
    WHERE old.brand_id = b.brand_id
      AND lower(regexp_replace(trim(old.address), '\s+', ' ', 'g')) = lower(regexp_replace(trim(v.address), '\s+', ' ', 'g'))
);
-- END VERIFIED BRANCH SEED
COMMIT;
