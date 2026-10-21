USE ElectronicCommerceDB;
GO

SET ANSI_NULLS ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

DECLARE @Categories TABLE (
    MaLoai CHAR(6) NOT NULL PRIMARY KEY,
    TenVI NVARCHAR(150) NOT NULL,
    MoTaVI NVARCHAR(500) NOT NULL,
    TenEN NVARCHAR(150) NOT NULL,
    MoTaEN NVARCHAR(500) NOT NULL
);

INSERT INTO @Categories (MaLoai, TenVI, MoTaVI, TenEN, MoTaEN)
VALUES
    ('PHONE1', N'Điện thoại', N'Điện thoại thông minh và thiết bị di động.', N'Smartphone', N'Smartphones and mobile devices.'),
    ('LAPTOP', N'Laptop', N'Máy tính xách tay.', N'Laptop', N'Portable laptop computers.'),
    ('WATCH1', N'Đồng hồ', N'Đồng hồ thông minh và thiết bị đeo.', N'Watch', N'Smartwatches and wearable devices.'),
    ('ACC001', N'Phụ kiện', N'Phụ kiện và linh kiện công nghệ.', N'Accessories', N'Tech accessories and components.');

INSERT INTO dbo.LOAI_SAN_PHAM (MaLoai, TrangThai)
SELECT C.MaLoai, 1
FROM @Categories C
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.LOAI_SAN_PHAM L WHERE L.MaLoai = C.MaLoai
);

/* Preserve existing product assignments while grouping every product into the four catalog categories. */
UPDATE SP
SET MaLoai = CASE
    WHEN SP.MaLoai = 'PHONE1' OR EXISTS (
        SELECT 1 FROM dbo.LOAI_SAN_PHAM_NGON_NGU T
        WHERE T.MaLoai = SP.MaLoai AND T.TenLoai IN (N'Điện thoại', N'Smartphone', N'Smartphones')
    ) THEN 'PHONE1'
    WHEN EXISTS (
        SELECT 1 FROM dbo.LOAI_SAN_PHAM_NGON_NGU T
        WHERE T.MaLoai = SP.MaLoai AND (T.TenLoai LIKE N'%laptop%' OR T.TenLoai LIKE N'%máy tính xách tay%')
    ) THEN 'LAPTOP'
    WHEN EXISTS (
        SELECT 1 FROM dbo.LOAI_SAN_PHAM_NGON_NGU T
        WHERE T.MaLoai = SP.MaLoai AND (T.TenLoai LIKE N'%đồng hồ%' OR T.TenLoai LIKE N'%watch%')
    ) THEN 'WATCH1'
    ELSE 'ACC001'
END
FROM dbo.SAN_PHAM SP;

UPDATE dbo.LOAI_SAN_PHAM
SET TrangThai = CASE WHEN MaLoai IN ('PHONE1', 'LAPTOP', 'WATCH1', 'ACC001') THEN 1 ELSE 0 END;

UPDATE T
SET TenLoai = CASE T.MaNgonNgu WHEN 'EN' THEN C.TenEN ELSE C.TenVI END,
    MoTa = CASE T.MaNgonNgu WHEN 'EN' THEN C.MoTaEN ELSE C.MoTaVI END
FROM dbo.LOAI_SAN_PHAM_NGON_NGU T
JOIN @Categories C ON C.MaLoai = T.MaLoai
WHERE T.MaNgonNgu IN ('VI', 'EN');

INSERT INTO dbo.LOAI_SAN_PHAM_NGON_NGU (MaLoai, MaNgonNgu, TenLoai, MoTa)
SELECT C.MaLoai, L.MaNgonNgu,
       CASE L.MaNgonNgu WHEN 'EN' THEN C.TenEN ELSE C.TenVI END,
       CASE L.MaNgonNgu WHEN 'EN' THEN C.MoTaEN ELSE C.MoTaVI END
FROM @Categories C
CROSS JOIN (VALUES ('VI'), ('EN')) L(MaNgonNgu)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.LOAI_SAN_PHAM_NGON_NGU T
    WHERE T.MaLoai = C.MaLoai AND T.MaNgonNgu = L.MaNgonNgu
);

COMMIT TRANSACTION;
GO

SELECT L.MaLoai, T.MaNgonNgu, T.TenLoai,
       COUNT(SP.MaSP) AS SoSanPham
FROM dbo.LOAI_SAN_PHAM L
JOIN dbo.LOAI_SAN_PHAM_NGON_NGU T ON T.MaLoai = L.MaLoai AND T.MaNgonNgu = 'VI'
LEFT JOIN dbo.SAN_PHAM SP ON SP.MaLoai = L.MaLoai
WHERE L.TrangThai = 1
GROUP BY L.MaLoai, T.MaNgonNgu, T.TenLoai
ORDER BY L.MaLoai;
GO
