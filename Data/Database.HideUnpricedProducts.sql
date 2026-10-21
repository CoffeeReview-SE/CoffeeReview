/* Keep unpriced products in the database for history/admin reference, but stop selling them. */
USE ElectronicCommerceDB;
GO

SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

UPDATE dbo.SAN_PHAM
SET TrangThai = 0
WHERE TrangThai = 1
  AND COALESCE(GiaBan, GiaNiemYet, 0) <= 0;

COMMIT TRANSACTION;
GO

SELECT COUNT(*) AS UnpricedProductsStillActive
FROM dbo.SAN_PHAM
WHERE TrangThai = 1
  AND COALESCE(GiaBan, GiaNiemYet, 0) <= 0;
GO
