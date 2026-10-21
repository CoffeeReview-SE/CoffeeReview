/* Add sample laptop and smartwatch products without rebuilding the database. */
USE ElectronicCommerceDB;
GO

SET ANSI_NULLS ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

DECLARE @Products TABLE (
    MaSP CHAR(8) NOT NULL PRIMARY KEY,
    MaLoai CHAR(6) NOT NULL,
    GiaNiemYet DECIMAL(18,2) NOT NULL,
    GiaBan DECIMAL(18,2) NOT NULL,
    TenVI NVARCHAR(200) NOT NULL,
    MoTaVI NVARCHAR(MAX) NOT NULL,
    TenEN NVARCHAR(200) NOT NULL,
    MoTaEN NVARCHAR(MAX) NOT NULL,
    SoLuongTon INT NOT NULL
);

INSERT INTO @Products VALUES
('SP000056','LAPTOP',22990000,19590000,
 N'Laptop ASUS Vivobook 15 X1504VA-BQ265W',
 N'Intel Core 5 120U, RAM 16GB DDR5, SSD NVMe 512GB, màn hình IPS Full HD 15,6 inch, Windows 11 Home.',
 N'ASUS Vivobook 15 X1504VA-BQ265W Laptop',
 N'Intel Core 5 120U, 16GB DDR5 RAM, 512GB NVMe SSD, 15.6-inch Full HD IPS display, Windows 11 Home.', 8),
('SP000057','LAPTOP',25990000,22990000,
 N'Laptop Acer Aspire 14 AI A14-11M-X8FP',
 N'Snapdragon X X1-26-100, RAM 16GB, SSD 512GB, màn hình WUXGA IPS 14 inch 120Hz, Windows 11 Home.',
 N'Acer Aspire 14 AI A14-11M-X8FP Laptop',
 N'Snapdragon X X1-26-100, 16GB RAM, 512GB SSD, 14-inch WUXGA IPS 120Hz display, Windows 11 Home.', 8),
('SP000058','WATCH1',9990000,9990000,
 N'Samsung Galaxy Watch9 Bluetooth 40mm',
 N'Màn hình Super AMOLED 1,3 inch, Bluetooth 6.0, GPS, bộ nhớ 32GB, pin 390mAh.',
 N'Samsung Galaxy Watch9 Bluetooth 40mm',
 N'1.3-inch Super AMOLED display, Bluetooth 6.0, GPS, 32GB storage, 390mAh battery.', 12),
('SP000059','WATCH1',10990000,10990000,
 N'Samsung Galaxy Watch9 Bluetooth 44mm',
 N'Màn hình Super AMOLED 1,5 inch, Bluetooth 6.0, GPS, bộ nhớ 32GB, pin 445mAh.',
 N'Samsung Galaxy Watch9 Bluetooth 44mm',
 N'1.5-inch Super AMOLED display, Bluetooth 6.0, GPS, 32GB storage, 445mAh battery.', 12);

INSERT INTO dbo.SAN_PHAM (MaSP, MaLoai, DonViTinh, GiaNiemYet, GiaBan, TrangThai)
SELECT P.MaSP, P.MaLoai, N'Chiếc', P.GiaNiemYet, P.GiaBan, 1
FROM @Products P
WHERE NOT EXISTS (SELECT 1 FROM dbo.SAN_PHAM S WHERE S.MaSP = P.MaSP);

INSERT INTO dbo.SAN_PHAM_NGON_NGU (MaSP, MaNgonNgu, TenSP, MoTa)
SELECT P.MaSP, L.MaNgonNgu,
       CASE L.MaNgonNgu WHEN 'EN' THEN P.TenEN ELSE P.TenVI END,
       CASE L.MaNgonNgu WHEN 'EN' THEN P.MoTaEN ELSE P.MoTaVI END
FROM @Products P
CROSS JOIN (VALUES ('VI'), ('EN')) L(MaNgonNgu)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.SAN_PHAM_NGON_NGU T
    WHERE T.MaSP = P.MaSP AND T.MaNgonNgu = L.MaNgonNgu
);

INSERT INTO dbo.TON_KHO (MaKho, MaSP, SoLuongTon)
SELECT 'KHO001', P.MaSP, P.SoLuongTon
FROM @Products P
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.TON_KHO T WHERE T.MaKho = 'KHO001' AND T.MaSP = P.MaSP
);

INSERT INTO dbo.LICH_SU_KHO (MaPhieu, LoaiPhieu, MaSP, SoLuong, DoiTac, GhiChu)
SELECT CONCAT(N'SEED-', RTRIM(P.MaSP)), N'Nhập kho', P.MaSP, P.SoLuongTon,
       N'Khởi tạo dữ liệu', N'Tồn đầu kỳ từ dữ liệu mẫu laptop và đồng hồ'
FROM @Products P
WHERE P.SoLuongTon > 0
  AND NOT EXISTS (
      SELECT 1 FROM dbo.LICH_SU_KHO H WHERE H.MaPhieu = CONCAT(N'SEED-', RTRIM(P.MaSP))
  );

COMMIT TRANSACTION;
GO

SELECT SP.MaSP, SP.MaLoai, T.TenSP, SP.GiaBan, TK.SoLuongTon
FROM dbo.SAN_PHAM SP
JOIN dbo.SAN_PHAM_NGON_NGU T ON T.MaSP = SP.MaSP AND T.MaNgonNgu = 'VI'
LEFT JOIN dbo.TON_KHO TK ON TK.MaSP = SP.MaSP AND TK.MaKho = 'KHO001'
WHERE SP.MaSP BETWEEN 'SP000056' AND 'SP000059'
ORDER BY SP.MaSP;
GO
