/*

SEED DATABASE - WEB/APP KINH DOANH DO DIEN TU
SQL Server

Nguon san pham/ thong tin:
- Samsung Viet Nam: https://www.samsung.com/vn/
- Apple Viet Nam: https://www.apple.com/vn/
- Xiaomi Viet Nam: https://www.mi.com/vn/
- Phong Vu: https://phongvu.vn/c/linh-kien-may-tinh
- GEARVN: https://gearvn.com/

Luu y:
1) Ten san pham, cau hinh, gia tham chieu duoi day duoc lay/doi chieu tu
   cac trang chinh thuc hoac trang ban hang duoc neu trong source comment.
2) Gia co the thay doi theo thoi diem, khuyen mai va khu vuc.
3) Khach hang, don hang, thanh toan, phieu nhap va ton kho la DU LIEU MAU
   de test he thong, khong phai du lieu giao dich that.
4) "iPhone" la dong san pham cua Apple.
5) Phan da ngon ngu duoc thiet ke theo huong:
   NGON_NGU <-> SAN_PHAM
   NGON_NGU <-> LOAI_SAN_PHAM

*/

-- Keep SQL Server session options compatible with indexed/persisted computed columns.
SET ANSI_NULLS ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET QUOTED_IDENTIFIER ON;
GO

IF DB_ID(N'ElectronicCommerceDB') IS NULL
    CREATE DATABASE ElectronicCommerceDB;
GO

USE ElectronicCommerceDB;
GO

DROP TABLE IF EXISTS CHI_TIET_THANH_TOAN;
DROP TABLE IF EXISTS THANH_TOAN;
DROP TABLE IF EXISTS CHI_TIET_PHIEU_NHAP;
DROP TABLE IF EXISTS PHIEU_NHAP;
DROP TABLE IF EXISTS LICH_SU_KHO;
DROP TABLE IF EXISTS CHI_TIET_DON_HANG;
DROP TABLE IF EXISTS DON_HANG;
DROP TABLE IF EXISTS CHI_TIET_GIO_HANG;
DROP TABLE IF EXISTS GIO_HANG;
DROP TABLE IF EXISTS TON_KHO;
DROP TABLE IF EXISTS KHO;
DROP TABLE IF EXISTS SAN_PHAM_NGON_NGU;
DROP TABLE IF EXISTS LOAI_SAN_PHAM_NGON_NGU;
DROP TABLE IF EXISTS SAN_PHAM;
DROP TABLE IF EXISTS LOAI_SAN_PHAM;
DROP TABLE IF EXISTS NGON_NGU;
DROP TABLE IF EXISTS NHA_CUNG_CAP;
DROP TABLE IF EXISTS KHACH_HANG;
GO

/* 
   1. NGON NGU
    */
CREATE TABLE NGON_NGU (
    MaNgonNgu CHAR(2) NOT NULL,
    TenNgonNgu NVARCHAR(50) NOT NULL,
    TrangThai BIT NOT NULL CONSTRAINT DF_NGON_NGU_TrangThai DEFAULT 1,
    CONSTRAINT PK_NGON_NGU PRIMARY KEY (MaNgonNgu)
);
GO

/* 2. LOAI SAN PHAM */
CREATE TABLE LOAI_SAN_PHAM (
    MaLoai CHAR(6) NOT NULL,
    TrangThai BIT NOT NULL CONSTRAINT DF_LOAI_SP_TrangThai DEFAULT 1,
    CONSTRAINT PK_LOAI_SAN_PHAM PRIMARY KEY (MaLoai)
);
GO

/* 
   3. LOAI SAN PHAM - NGON NGU
    */
CREATE TABLE LOAI_SAN_PHAM_NGON_NGU (
    MaLoai CHAR(6) NOT NULL,
    MaNgonNgu CHAR(2) NOT NULL,
    TenLoai NVARCHAR(150) NOT NULL,
    MoTa NVARCHAR(500) NULL,
    CONSTRAINT PK_LOAI_SP_NGON_NGU PRIMARY KEY (MaLoai, MaNgonNgu),
    CONSTRAINT FK_LSPNN_LSP FOREIGN KEY (MaLoai)
        REFERENCES LOAI_SAN_PHAM(MaLoai),
    CONSTRAINT FK_LSPNN_NN FOREIGN KEY (MaNgonNgu)
        REFERENCES NGON_NGU(MaNgonNgu)
);
GO

/* 
   4. SAN PHAM
    */
CREATE TABLE SAN_PHAM (
    MaSP CHAR(8) NOT NULL,
    MaLoai CHAR(6) NOT NULL,
    DonViTinh NVARCHAR(30) NOT NULL,
    GiaNiemYet DECIMAL(18,2) NULL,
    GiaBan DECIMAL(18,2) NULL,
    TrangThai BIT NOT NULL CONSTRAINT DF_SAN_PHAM_TrangThai DEFAULT 1,
    CONSTRAINT PK_SAN_PHAM PRIMARY KEY (MaSP),
    CONSTRAINT FK_SAN_PHAM_LOAI FOREIGN KEY (MaLoai)
        REFERENCES LOAI_SAN_PHAM(MaLoai),
    CONSTRAINT CK_SAN_PHAM_GIA CHECK (
        (GiaNiemYet IS NULL OR GiaNiemYet >= 0)
        AND (GiaBan IS NULL OR GiaBan >= 0)
    )
);
GO

/* 
   5. SAN PHAM - NGON NGU
    */
CREATE TABLE SAN_PHAM_NGON_NGU (
    MaSP CHAR(8) NOT NULL,
    MaNgonNgu CHAR(2) NOT NULL,
    TenSP NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(MAX) NULL,
    CONSTRAINT PK_SAN_PHAM_NGON_NGU PRIMARY KEY (MaSP, MaNgonNgu),
    CONSTRAINT FK_SPNN_SP FOREIGN KEY (MaSP)
        REFERENCES SAN_PHAM(MaSP),
    CONSTRAINT FK_SPNN_NN FOREIGN KEY (MaNgonNgu)
        REFERENCES NGON_NGU(MaNgonNgu)
);
GO

/* 
   6. KHO
    */
CREATE TABLE KHO (
    MaKho CHAR(6) NOT NULL,
    TenKho NVARCHAR(150) NOT NULL,
    CONSTRAINT PK_KHO PRIMARY KEY (MaKho)
);
GO

/* 
   7. TON KHO - QUAN HE KHO/SAN PHAM
    */
CREATE TABLE TON_KHO (
    MaKho CHAR(6) NOT NULL,
    MaSP CHAR(8) NOT NULL,
    SoLuongTon INT NOT NULL CONSTRAINT DF_TON_KHO_SoLuong DEFAULT 0,
    MucTonToiThieu INT NOT NULL CONSTRAINT DF_TON_KHO_MucTonToiThieu DEFAULT 5,
    CONSTRAINT PK_TON_KHO PRIMARY KEY (MaKho, MaSP),
    CONSTRAINT FK_TON_KHO_KHO FOREIGN KEY (MaKho)
        REFERENCES KHO(MaKho),
    CONSTRAINT FK_TON_KHO_SP FOREIGN KEY (MaSP)
        REFERENCES SAN_PHAM(MaSP),
    CONSTRAINT CK_TON_KHO_SoLuong CHECK (SoLuongTon >= 0)
);
GO

CREATE TABLE LICH_SU_KHO (
    MaPhieu NVARCHAR(32) NOT NULL,
    LoaiPhieu NVARCHAR(20) NOT NULL,
    MaSP CHAR(8) NOT NULL,
    SoLuong INT NOT NULL,
    DoiTac NVARCHAR(200) NOT NULL CONSTRAINT DF_LICH_SU_KHO_DoiTac DEFAULT N'',
    GhiChu NVARCHAR(500) NOT NULL CONSTRAINT DF_LICH_SU_KHO_GhiChu DEFAULT N'',
    NgayTao DATETIME2 NOT NULL CONSTRAINT DF_LICH_SU_KHO_NgayTao DEFAULT SYSDATETIME(),
    CONSTRAINT PK_LICH_SU_KHO PRIMARY KEY (MaPhieu),
    CONSTRAINT FK_LICH_SU_KHO_SAN_PHAM FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP),
    CONSTRAINT CK_LICH_SU_KHO_Loai CHECK (LoaiPhieu IN (N'Nhập kho', N'Xuất kho')),
    CONSTRAINT CK_LICH_SU_KHO_SoLuong CHECK (SoLuong > 0)
);
GO

/* 
   8. KHACH HANG
    */
CREATE TABLE KHACH_HANG (
    MaKH CHAR(8) NOT NULL,
    HoTen NVARCHAR(150) NOT NULL,
    SDT VARCHAR(20) NOT NULL,
    DiaChi NVARCHAR(300) NULL,
    Email VARCHAR(255) NULL,
    CONSTRAINT PK_KHACH_HANG PRIMARY KEY (MaKH),
    CONSTRAINT UQ_KHACH_HANG_SDT UNIQUE (SDT),
    CONSTRAINT UQ_KHACH_HANG_Email UNIQUE (Email)
);
GO

/* 
   9. GIO HANG
    */
CREATE TABLE GIO_HANG (
    MaGioHang CHAR(8) NOT NULL,
    MaKH CHAR(8) NOT NULL,
    NgayTao DATETIME2 NOT NULL CONSTRAINT DF_GIO_HANG_NgayTao DEFAULT SYSDATETIME(),
    NgayCapNhat DATETIME2 NULL,
    CONSTRAINT PK_GIO_HANG PRIMARY KEY (MaGioHang),
    CONSTRAINT UQ_GIO_HANG_MaKH UNIQUE (MaKH),
    CONSTRAINT FK_GIO_HANG_KH FOREIGN KEY (MaKH)
        REFERENCES KHACH_HANG(MaKH)
);
GO

/* 
   10. CHI TIET GIO HANG
    */
CREATE TABLE CHI_TIET_GIO_HANG (
    MaGioHang CHAR(8) NOT NULL,
    MaSP CHAR(8) NOT NULL,
    SoLuong INT NOT NULL,
    CONSTRAINT PK_CT_GIO_HANG PRIMARY KEY (MaGioHang, MaSP),
    CONSTRAINT FK_CTGH_GH FOREIGN KEY (MaGioHang)
        REFERENCES GIO_HANG(MaGioHang),
    CONSTRAINT FK_CTGH_SP FOREIGN KEY (MaSP)
        REFERENCES SAN_PHAM(MaSP),
    CONSTRAINT CK_CTGH_SoLuong CHECK (SoLuong > 0)
);
GO

/* 
   11. DON HANG
    */
CREATE TABLE DON_HANG (
    MaDH CHAR(8) NOT NULL,
    MaKH CHAR(8) NOT NULL,
    NgayLap DATETIME2 NOT NULL CONSTRAINT DF_DON_HANG_NgayLap DEFAULT SYSDATETIME(),
    TrangThai NVARCHAR(40) NOT NULL CONSTRAINT DF_DON_HANG_TrangThai DEFAULT N'Chờ xác nhận',
    DiaChiGiaoHang NVARCHAR(300) NOT NULL,
    CONSTRAINT PK_DON_HANG PRIMARY KEY (MaDH),
    CONSTRAINT FK_DON_HANG_KH FOREIGN KEY (MaKH)
        REFERENCES KHACH_HANG(MaKH)
);
GO

/* 
   12. CHI TIET DON HANG
    */
CREATE TABLE CHI_TIET_DON_HANG (
    MaDH CHAR(8) NOT NULL,
    MaSP CHAR(8) NOT NULL,
    SoLuongDat INT NOT NULL,
    DonGia DECIMAL(18,2) NOT NULL,
    TyLeGiamGia DECIMAL(5,2) NOT NULL CONSTRAINT DF_CT_DH_GiamGia DEFAULT 0,
    DonGiaThucTe AS (DonGia * (1 - TyLeGiamGia / 100.0)) PERSISTED,
    ThanhTien AS (SoLuongDat * DonGia * (1 - TyLeGiamGia / 100.0)) PERSISTED,
    CONSTRAINT PK_CT_DON_HANG PRIMARY KEY (MaDH, MaSP),
    CONSTRAINT FK_CTDH_DH FOREIGN KEY (MaDH)
        REFERENCES DON_HANG(MaDH),
    CONSTRAINT FK_CTDH_SP FOREIGN KEY (MaSP)
        REFERENCES SAN_PHAM(MaSP),
    CONSTRAINT CK_CTDH_SoLuong CHECK (SoLuongDat > 0),
    CONSTRAINT CK_CTDH_Gia CHECK (DonGia >= 0),
    CONSTRAINT CK_CTDH_GiamGia CHECK (TyLeGiamGia >= 0 AND TyLeGiamGia <= 100)
);
GO

/* 
   13. THANH TOAN
   1 don hang co toi da 1 thanh toan
    */
CREATE TABLE THANH_TOAN (
    MaThanhToan CHAR(8) NOT NULL,
    MaDH CHAR(8) NOT NULL,
    NgayThanhToan DATETIME2 NULL,
    SoTienThanhToan DECIMAL(18,2) NOT NULL,
    PhuongThucThanhToan NVARCHAR(50) NOT NULL,
    TrangThai NVARCHAR(40) NOT NULL,
    CONSTRAINT PK_THANH_TOAN PRIMARY KEY (MaThanhToan),
    CONSTRAINT UQ_THANH_TOAN_MaDH UNIQUE (MaDH),
    CONSTRAINT FK_THANH_TOAN_DH FOREIGN KEY (MaDH)
        REFERENCES DON_HANG(MaDH),
    CONSTRAINT CK_THANH_TOAN_SoTien CHECK (SoTienThanhToan >= 0)
);
GO

/* 
   14. NHA CUNG CAP
    */
CREATE TABLE NHA_CUNG_CAP (
    MaNCC CHAR(8) NOT NULL,
    TenNCC NVARCHAR(200) NOT NULL,
    DiaChi NVARCHAR(300) NULL,
    Email VARCHAR(255) NULL,
    SDT VARCHAR(20) NULL,
    CONSTRAINT PK_NHA_CUNG_CAP PRIMARY KEY (MaNCC)
);
GO

/* 
   15. PHIEU NHAP
    */
CREATE TABLE PHIEU_NHAP (
    MaPN CHAR(8) NOT NULL,
    MaNCC CHAR(8) NOT NULL,
    MaKho CHAR(6) NOT NULL,
    NgayNhap DATETIME2 NOT NULL CONSTRAINT DF_PHIEU_NHAP_NgayNhap DEFAULT SYSDATETIME(),
    CONSTRAINT PK_PHIEU_NHAP PRIMARY KEY (MaPN),
    CONSTRAINT FK_PHIEU_NHAP_NCC FOREIGN KEY (MaNCC)
        REFERENCES NHA_CUNG_CAP(MaNCC),
    CONSTRAINT FK_PHIEU_NHAP_KHO FOREIGN KEY (MaKho)
        REFERENCES KHO(MaKho)
);
GO

/* 
   16. CHI TIET PHIEU NHAP
    */
CREATE TABLE CHI_TIET_PHIEU_NHAP (
    MaPN CHAR(8) NOT NULL,
    MaSP CHAR(8) NOT NULL,
    SoLuongNhap INT NOT NULL,
    DonGiaNhap DECIMAL(18,2) NOT NULL,
    ThanhTien AS (SoLuongNhap * DonGiaNhap) PERSISTED,
    CONSTRAINT PK_CT_PHIEU_NHAP PRIMARY KEY (MaPN, MaSP),
    CONSTRAINT FK_CTPN_PN FOREIGN KEY (MaPN)
        REFERENCES PHIEU_NHAP(MaPN),
    CONSTRAINT FK_CTPN_SP FOREIGN KEY (MaSP)
        REFERENCES SAN_PHAM(MaSP),
    CONSTRAINT CK_CTPN_SoLuong CHECK (SoLuongNhap > 0),
    CONSTRAINT CK_CTPN_DonGia CHECK (DonGiaNhap >= 0)
);
GO

/* 
   SEED DATA
    */

/* 1. Ngon ngu */
INSERT INTO NGON_NGU (MaNgonNgu, TenNgonNgu, TrangThai)
VALUES
('VI', N'Tiếng Việt', 1),
('EN', N'English', 1);
GO

/* 2. Loai san pham */
INSERT INTO LOAI_SAN_PHAM (MaLoai, TrangThai)
VALUES
('PHONE1', 1),
('LAPTOP', 1),
('WATCH1', 1),
('ACC001', 1);
GO

INSERT INTO LOAI_SAN_PHAM_NGON_NGU (MaLoai, MaNgonNgu, TenLoai, MoTa)
VALUES
('PHONE1','VI',N'Điện thoại',N'Điện thoại thông minh và thiết bị di động.'),
('PHONE1','EN',N'Smartphone',N'Smartphones and mobile devices.'),
('LAPTOP','VI',N'Laptop',N'Máy tính xách tay.'),
('LAPTOP','EN',N'Laptop',N'Portable laptop computers.'),
('WATCH1','VI',N'Đồng hồ',N'Đồng hồ thông minh và thiết bị đeo.'),
('WATCH1','EN',N'Watch',N'Smartwatches and wearable devices.'),
('ACC001','VI',N'Phụ kiện',N'Phụ kiện và linh kiện công nghệ.'),
('ACC001','EN',N'Accessories',N'Tech accessories and components.');
GO

/* 3. San pham
   Du lieu dien thoai duoc mo rong theo cac mau/dong san pham hien dien tren cac trang chinh thuc da kiem tra.
   Samsung: Samsung Viet Nam; Apple/iPhone: Apple Viet Nam; Xiaomi/Redmi/POCO: Xiaomi Viet Nam.
   Linh kien PC: Phong Vu. Gia cua san pham chua co gia hien hanh duoc de NULL thay vi dung gia cua ca bo PC.
*/
INSERT INTO SAN_PHAM
(MaSP, MaLoai, DonViTinh, GiaNiemYet, GiaBan, TrangThai)
VALUES
('SP000001','PHONE1',N'Chiếc',22572000,22572000,1),
('SP000002','PHONE1',N'Chiếc',16690000,16690000,1),
('SP000003','PHONE1',N'Chiếc',24999000,24999000,1),
('SP000004','PHONE1',N'Chiếc',26500000,24500000,1),
('SP000005','PHONE1',N'Chiếc',34360000,24990000,1),
('SP000006','PHONE1',N'Chiếc',8830000,8430000,1),
('SP000015','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000016','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000017','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000018','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000019','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000020','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000021','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000022','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000023','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000024','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000025','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000026','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000027','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000028','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000029','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000030','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000031','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000032','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000033','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000034','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000035','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000036','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000037','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000038','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000039','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000040','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000041','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000042','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000043','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000044','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000045','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000046','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000047','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000048','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000049','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000050','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000051','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000052','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000053','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000054','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000055','PHONE1',N'Chiếc',NULL,NULL,1),
('SP000056','LAPTOP',N'Chiếc',22990000,19590000,1),
('SP000057','LAPTOP',N'Chiếc',25990000,22990000,1),
('SP000058','WATCH1',N'Chiếc',9990000,9990000,1),
('SP000059','WATCH1',N'Chiếc',10990000,10990000,1),
('SP000007','ACC001',N'Chiếc',11990000,9590000,1),
('SP000008','ACC001',N'Chiếc',4790000,3790000,1),
('SP000009','ACC001',N'Chiếc',14490000,11590000,1),
('SP000010','ACC001',N'Chiếc',2490000,1790000,1),
('SP000011','ACC001',N'Thanh',5490000,2690000,1);
GO

/* Keep products with no configured selling price out of the active storefront. */
UPDATE dbo.SAN_PHAM
SET TrangThai = 0
WHERE COALESCE(GiaBan, GiaNiemYet, 0) <= 0;
GO

/* 4. Ten va mo ta da ngon ngu */
INSERT INTO SAN_PHAM_NGON_NGU (MaSP, MaNgonNgu, TenSP, MoTa)
VALUES
('SP000001','VI',N'Samsung Galaxy S25 256GB',N'Galaxy S25 với màn hình 6,2 inch và các tính năng Galaxy AI.'),

('SP000001','EN',N'Samsung Galaxy S25 256GB',N'Galaxy S25 with a 6.2-inch display and Galaxy AI features.'),

('SP000002','VI',N'Samsung Galaxy S25 FE 128GB 8GB',N'Galaxy S25 FE phiên bản 128GB và 8GB RAM.'),

('SP000002','EN',N'Samsung Galaxy S25 FE 128GB 8GB',N'Galaxy S25 FE with 128GB storage and 8GB RAM.'),

('SP000003','VI',N'Apple iPhone 16 128GB',N'iPhone 16 với màn hình Super Retina XDR OLED 6,1 inch và chip A18.'),

('SP000003','EN',N'Apple iPhone 16 128GB',N'iPhone 16 with a 6.1-inch Super Retina XDR OLED display and A18 chip.'),

('SP000004','VI',N'Xiaomi 15 12GB 512GB',N'Xiaomi 15 với Snapdragon 8 Elite và màn hình 6,36 inch.'),

('SP000004','EN',N'Xiaomi 15 12GB 512GB',N'Xiaomi 15 with Snapdragon 8 Elite and a 6.36-inch display.'),

('SP000005','VI',N'Xiaomi 15 Ultra 16GB 512GB',N'Xiaomi 15 Ultra với hệ thống camera Leica và màn hình WQHD+ 6,73 inch.'),

('SP000005','EN',N'Xiaomi 15 Ultra 16GB 512GB',N'Xiaomi 15 Ultra with Leica camera system and a 6.73-inch WQHD+ display.'),

('SP000006','VI',N'Redmi Note 14 Pro 12GB 256GB',N'Redmi Note 14 Pro với màn hình AMOLED 6,67 inch.'),

('SP000006','EN',N'Redmi Note 14 Pro 12GB 256GB',N'Redmi Note 14 Pro with a 6.67-inch AMOLED display.'),

('SP000015','VI',N'Samsung Galaxy S26 256GB',N'Galaxy S26, bộ nhớ 256GB, thuộc Galaxy S26 series hiện hành.'),

('SP000015','EN',N'Samsung Galaxy S26 256GB',N'Galaxy S26, 256GB, part of the current Galaxy S26 series.'),

('SP000016','VI',N'Samsung Galaxy S26 512GB',N'Galaxy S26, bộ nhớ 512GB.'),

('SP000016','EN',N'Samsung Galaxy S26 512GB',N'Galaxy S26, 512GB.'),

('SP000017','VI',N'Samsung Galaxy S26+ 256GB',N'Galaxy S26+ với tùy chọn bộ nhớ 256GB.'),

('SP000017','EN',N'Samsung Galaxy S26+ 256GB',N'Galaxy S26+ with 256GB storage.'),

('SP000018','VI',N'Samsung Galaxy S26+ 512GB',N'Galaxy S26+ với tùy chọn bộ nhớ 512GB.'),

('SP000018','EN',N'Samsung Galaxy S26+ 512GB',N'Galaxy S26+ with 512GB storage.'),

('SP000019','VI',N'Samsung Galaxy S26 Ultra 256GB',N'Galaxy S26 Ultra với bộ nhớ 256GB.'),

('SP000019','EN',N'Samsung Galaxy S26 Ultra 256GB',N'Galaxy S26 Ultra with 256GB storage.'),

('SP000020','VI',N'Samsung Galaxy S26 Ultra 512GB',N'Galaxy S26 Ultra với bộ nhớ 512GB.'),

('SP000020','EN',N'Samsung Galaxy S26 Ultra 512GB',N'Galaxy S26 Ultra with 512GB storage.'),

('SP000021','VI',N'Samsung Galaxy S26 Ultra 1TB',N'Galaxy S26 Ultra với bộ nhớ 1TB.'),

('SP000021','EN',N'Samsung Galaxy S26 Ultra 1TB',N'Galaxy S26 Ultra with 1TB storage.'),

('SP000022','VI',N'Samsung Galaxy S26 FE',N'Galaxy S26 FE thuộc dòng Galaxy S hiện hành.'),

('SP000022','EN',N'Samsung Galaxy S26 FE',N'Galaxy S26 FE from the current Galaxy S family.'),

('SP000023','VI',N'Samsung Galaxy Z Fold7',N'Điện thoại gập Galaxy Z Fold7.'),

('SP000023','EN',N'Samsung Galaxy Z Fold7',N'Galaxy Z Fold7 foldable smartphone.'),

('SP000024','VI',N'Samsung Galaxy Z Flip7',N'Điện thoại gập Galaxy Z Flip7.'),

('SP000024','EN',N'Samsung Galaxy Z Flip7',N'Galaxy Z Flip7 foldable smartphone.'),

('SP000025','VI',N'Samsung Galaxy Z Flip7 FE',N'Điện thoại gập Galaxy Z Flip7 FE.'),

('SP000025','EN',N'Samsung Galaxy Z Flip7 FE',N'Galaxy Z Flip7 FE foldable smartphone.'),

('SP000026','VI',N'Samsung Galaxy A56 5G 8GB 128GB',N'Galaxy A56 5G phiên bản 8GB/128GB.'),

('SP000026','EN',N'Samsung Galaxy A56 5G 8GB 128GB',N'Galaxy A56 5G with 8GB RAM and 128GB storage.'),

('SP000027','VI',N'Samsung Galaxy A56 5G 8GB 256GB',N'Galaxy A56 5G phiên bản 8GB/256GB.'),

('SP000027','EN',N'Samsung Galaxy A56 5G 8GB 256GB',N'Galaxy A56 5G with 8GB RAM and 256GB storage.'),

('SP000028','VI',N'Samsung Galaxy A36 5G 8GB 128GB',N'Galaxy A36 5G phiên bản 8GB/128GB.'),

('SP000028','EN',N'Samsung Galaxy A36 5G 8GB 128GB',N'Galaxy A36 5G with 8GB RAM and 128GB storage.'),

('SP000029','VI',N'Samsung Galaxy A36 5G 8GB 256GB',N'Galaxy A36 5G phiên bản 8GB/256GB.'),

('SP000029','EN',N'Samsung Galaxy A36 5G 8GB 256GB',N'Galaxy A36 5G with 8GB RAM and 256GB storage.'),

('SP000030','VI',N'Samsung Galaxy A26 5G',N'Galaxy A26 5G thuộc Galaxy A series.'),

('SP000030','EN',N'Samsung Galaxy A26 5G',N'Galaxy A26 5G from the Galaxy A series.'),

('SP000031','VI',N'Apple iPhone 18 Pro',N'iPhone 18 Pro được Apple Việt Nam liệt kê trong danh mục iPhone hiện hành.'),

('SP000031','EN',N'Apple iPhone 18 Pro',N'iPhone 18 Pro listed in Apple Vietnam current iPhone lineup.'),

('SP000032','VI',N'Apple iPhone 18 Pro Max',N'iPhone 18 Pro Max trong danh mục iPhone hiện hành.'),

('SP000032','EN',N'Apple iPhone 18 Pro Max',N'iPhone 18 Pro Max in the current iPhone lineup.'),

('SP000033','VI',N'Apple iPhone Air',N'iPhone Air trong danh mục iPhone hiện hành.'),

('SP000033','EN',N'Apple iPhone Air',N'iPhone Air in the current iPhone lineup.'),

('SP000034','VI',N'Apple iPhone 17 Pro',N'iPhone 17 Pro trong danh mục iPhone hiện hành.'),

('SP000034','EN',N'Apple iPhone 17 Pro',N'iPhone 17 Pro in the current iPhone lineup.'),

('SP000035','VI',N'Apple iPhone 17 Pro Max',N'iPhone 17 Pro Max trong danh mục iPhone hiện hành.'),

('SP000035','EN',N'Apple iPhone 17 Pro Max',N'iPhone 17 Pro Max in the current iPhone lineup.'),

('SP000036','VI',N'Apple iPhone 17',N'iPhone 17 trong danh mục iPhone hiện hành.'),

('SP000036','EN',N'Apple iPhone 17',N'iPhone 17 in the current iPhone lineup.'),

('SP000037','VI',N'Apple iPhone 17e',N'iPhone 17e trong danh mục iPhone hiện hành.'),

('SP000037','EN',N'Apple iPhone 17e',N'iPhone 17e in the current iPhone lineup.'),

('SP000038','VI',N'Xiaomi 17',N'Xiaomi 17 trong danh mục smartphone Xiaomi Việt Nam.'),

('SP000038','EN',N'Xiaomi 17',N'Xiaomi 17 in the Xiaomi Vietnam smartphone catalog.'),

('SP000039','VI',N'Xiaomi 17 Ultra',N'Xiaomi 17 Ultra trong danh mục smartphone Xiaomi Việt Nam.'),

('SP000039','EN',N'Xiaomi 17 Ultra',N'Xiaomi 17 Ultra in the Xiaomi Vietnam smartphone catalog.'),

('SP000040','VI',N'Xiaomi 15T',N'Xiaomi 15T trong danh mục smartphone Xiaomi Việt Nam.'),

('SP000040','EN',N'Xiaomi 15T',N'Xiaomi 15T in the Xiaomi Vietnam smartphone catalog.'),

('SP000041','VI',N'Xiaomi 15T Pro',N'Xiaomi 15T Pro trong danh mục smartphone Xiaomi Việt Nam.'),

('SP000041','EN',N'Xiaomi 15T Pro',N'Xiaomi 15T Pro in the Xiaomi Vietnam smartphone catalog.'),

('SP000042','VI',N'Xiaomi 14T',N'Xiaomi 14T trong danh mục smartphone Xiaomi Việt Nam.'),

('SP000042','EN',N'Xiaomi 14T',N'Xiaomi 14T in the Xiaomi Vietnam smartphone catalog.'),

('SP000043','VI',N'Xiaomi 14T Pro',N'Xiaomi 14T Pro trong danh mục smartphone Xiaomi Việt Nam.'),

('SP000043','EN',N'Xiaomi 14T Pro',N'Xiaomi 14T Pro in the Xiaomi Vietnam smartphone catalog.'),

('SP000044','VI',N'Redmi Note 15 Pro+ 5G',N'Redmi Note 15 Pro+ 5G trong danh mục Xiaomi Việt Nam.'),

('SP000044','EN',N'Redmi Note 15 Pro+ 5G',N'Redmi Note 15 Pro+ 5G in the Xiaomi Vietnam catalog.'),

('SP000045','VI',N'Redmi Note 15 Pro 5G',N'Redmi Note 15 Pro 5G trong danh mục Xiaomi Việt Nam.'),

('SP000045','EN',N'Redmi Note 15 Pro 5G',N'Redmi Note 15 Pro 5G in the Xiaomi Vietnam catalog.'),

('SP000046','VI',N'Redmi Note 15 5G',N'Redmi Note 15 5G trong danh mục Xiaomi Việt Nam.'),

('SP000046','EN',N'Redmi Note 15 5G',N'Redmi Note 15 5G in the Xiaomi Vietnam catalog.'),

('SP000047','VI',N'Redmi Note 15 Pro',N'Redmi Note 15 Pro trong danh mục Xiaomi Việt Nam.'),

('SP000047','EN',N'Redmi Note 15 Pro',N'Redmi Note 15 Pro in the Xiaomi Vietnam catalog.'),

('SP000048','VI',N'Redmi Note 15',N'Redmi Note 15 trong danh mục Xiaomi Việt Nam.'),

('SP000048','EN',N'Redmi Note 15',N'Redmi Note 15 in the Xiaomi Vietnam catalog.'),

('SP000049','VI',N'Redmi 15 5G',N'Redmi 15 5G trong danh mục Xiaomi Việt Nam.'),

('SP000049','EN',N'Redmi 15 5G',N'Redmi 15 5G in the Xiaomi Vietnam catalog.'),

('SP000050','VI',N'Redmi 15C',N'Redmi 15C trong danh mục Xiaomi Việt Nam.'),

('SP000050','EN',N'Redmi 15C',N'Redmi 15C in the Xiaomi Vietnam catalog.'),

('SP000051','VI',N'POCO F8 Pro',N'POCO F8 Pro trong danh mục Xiaomi Việt Nam.'),

('SP000051','EN',N'POCO F8 Pro',N'POCO F8 Pro in the Xiaomi Vietnam catalog.'),

('SP000052','VI',N'POCO M8 5G',N'POCO M8 5G trong danh mục Xiaomi Việt Nam.'),

('SP000052','EN',N'POCO M8 5G',N'POCO M8 5G in the Xiaomi Vietnam catalog.'),

('SP000053','VI',N'POCO M8 Pro 5G',N'POCO M8 Pro 5G trong danh mục Xiaomi Việt Nam.'),

('SP000053','EN',N'POCO M8 Pro 5G',N'POCO M8 Pro 5G in the Xiaomi Vietnam catalog.'),

('SP000054','VI',N'POCO X8 Pro',N'POCO X8 Pro trong danh mục Xiaomi Việt Nam.'),

('SP000054','EN',N'POCO X8 Pro',N'POCO X8 Pro in the Xiaomi Vietnam catalog.'),

('SP000055','VI',N'POCO M7 Pro 5G',N'POCO M7 Pro 5G trong danh mục Xiaomi Việt Nam.'),

('SP000055','EN',N'POCO M7 Pro 5G',N'POCO M7 Pro 5G in the Xiaomi Vietnam catalog.'),

('SP000007','VI',N'Intel Core Ultra 7-270K Plus',N'Bộ vi xử lý được Phong Vũ niêm yết trong nhóm linh kiện máy tính.'),

('SP000007','EN',N'Intel Core Ultra 7-270K Plus',N'Processor listed by Phong Vu in its computer components catalog.'),

('SP000008','VI',N'Kingston SSD SNV3S 500GB M.2 NVMe',N'Ổ SSD Kingston SNV3S 500GB M.2 NVMe.'),

('SP000008','EN',N'Kingston SSD SNV3S 500GB M.2 NVMe',N'Kingston SNV3S 500GB M.2 NVMe SSD.'),

('SP000009','VI',N'Gigabyte GeForce RTX 3060 WINDFORCE OC 12G',N'Card đồ họa Gigabyte GeForce RTX 3060 WINDFORCE OC 12G.'),

('SP000009','EN',N'Gigabyte GeForce RTX 3060 WINDFORCE OC 12G',N'Gigabyte GeForce RTX 3060 WINDFORCE OC 12G graphics card.'),

('SP000010','VI',N'MSI PRO H610M-E DDR4',N'Bo mạch chủ MSI PRO H610M-E DDR4.'),

('SP000010','EN',N'MSI PRO H610M-E DDR4',N'MSI PRO H610M-E DDR4 motherboard.'),

('SP000011','VI',N'Patriot RAM 16GB DDR4 3200MHz',N'RAM Patriot 16GB DDR4 3200MHz.'),

('SP000011','EN',N'Patriot 16GB DDR4 3200MHz RAM',N'Patriot 16GB DDR4 3200MHz memory.'),
('SP000056','VI',N'Laptop ASUS Vivobook 15 X1504VA-BQ265W',N'Intel Core 5 120U, RAM 16GB DDR5, SSD NVMe 512GB, màn hình IPS Full HD 15,6 inch, Windows 11 Home.'),
('SP000056','EN',N'ASUS Vivobook 15 X1504VA-BQ265W Laptop',N'Intel Core 5 120U, 16GB DDR5 RAM, 512GB NVMe SSD, 15.6-inch Full HD IPS display, Windows 11 Home.'),
('SP000057','VI',N'Laptop Acer Aspire 14 AI A14-11M-X8FP',N'Snapdragon X X1-26-100, RAM 16GB, SSD 512GB, màn hình WUXGA IPS 14 inch 120Hz, Windows 11 Home.'),
('SP000057','EN',N'Acer Aspire 14 AI A14-11M-X8FP Laptop',N'Snapdragon X X1-26-100, 16GB RAM, 512GB SSD, 14-inch WUXGA IPS 120Hz display, Windows 11 Home.'),
('SP000058','VI',N'Samsung Galaxy Watch9 Bluetooth 40mm',N'Màn hình Super AMOLED 1,3 inch, Bluetooth 6.0, GPS, bộ nhớ 32GB, pin 390mAh.'),
('SP000058','EN',N'Samsung Galaxy Watch9 Bluetooth 40mm',N'1.3-inch Super AMOLED display, Bluetooth 6.0, GPS, 32GB storage, 390mAh battery.'),
('SP000059','VI',N'Samsung Galaxy Watch9 Bluetooth 44mm',N'Màn hình Super AMOLED 1,5 inch, Bluetooth 6.0, GPS, bộ nhớ 32GB, pin 445mAh.'),
('SP000059','EN',N'Samsung Galaxy Watch9 Bluetooth 44mm',N'1.5-inch Super AMOLED display, Bluetooth 6.0, GPS, 32GB storage, 445mAh battery.');
GO
/* 5. Nha cung cap / kenh cung ung mau */
INSERT INTO NHA_CUNG_CAP (MaNCC, TenNCC, DiaChi, Email, SDT)
VALUES
('NCC00001',N'Samsung Electronics Vietnam',N'Việt Nam',NULL,'1800 588 889'),
('NCC00002',N'Apple',N'Việt Nam',NULL,NULL),
('NCC00003',N'Xiaomi Vietnam',N'Việt Nam',N'service.vn@support.mi.com','1800400410'),
('NCC00004',N'Phong Vũ',N'Việt Nam',NULL,'1800 6867'),
('NCC00005',N'GEARVN',N'82 Hoàng Hoa Thám, TP. Hồ Chí Minh',N'cskh@gearvn.com','1900 5301');
GO

/* 6. Kho */
INSERT INTO KHO (MaKho, TenKho)
VALUES
('KHO001',N'Kho trung tâm');
GO

/* 7. Ton kho mau */
INSERT INTO TON_KHO (MaKho, MaSP, SoLuongTon)
VALUES
('KHO001','SP000001',20),
('KHO001','SP000002',20),
('KHO001','SP000003',20),
('KHO001','SP000004',20),
('KHO001','SP000005',8),
('KHO001','SP000006',20),
('KHO001','SP000015',20),
('KHO001','SP000016',20),
('KHO001','SP000017',20),
('KHO001','SP000018',20),
('KHO001','SP000019',8),
('KHO001','SP000020',8),
('KHO001','SP000021',8),
('KHO001','SP000022',20),
('KHO001','SP000023',20),
('KHO001','SP000024',20),
('KHO001','SP000025',20),
('KHO001','SP000026',20),
('KHO001','SP000027',20),
('KHO001','SP000028',20),
('KHO001','SP000029',20),
('KHO001','SP000030',20),
('KHO001','SP000031',20),
('KHO001','SP000032',8),
('KHO001','SP000033',20),
('KHO001','SP000034',8),
('KHO001','SP000035',8),
('KHO001','SP000036',20),
('KHO001','SP000037',20),
('KHO001','SP000038',12),
('KHO001','SP000039',12),
('KHO001','SP000040',12),
('KHO001','SP000041',12),
('KHO001','SP000042',12),
('KHO001','SP000043',12),
('KHO001','SP000044',12),
('KHO001','SP000045',12),
('KHO001','SP000046',12),
('KHO001','SP000047',12),
('KHO001','SP000048',12),
('KHO001','SP000049',12),
('KHO001','SP000050',12),
('KHO001','SP000051',12),
('KHO001','SP000052',12),
('KHO001','SP000053',12),
('KHO001','SP000054',12),
('KHO001','SP000055',12),
('KHO001','SP000056',8),
('KHO001','SP000057',8),
('KHO001','SP000058',12),
('KHO001','SP000059',12),
('KHO001','SP000007',20),
('KHO001','SP000008',20),
('KHO001','SP000009',20),
('KHO001','SP000010',20),
('KHO001','SP000011',20);
GO

INSERT INTO LICH_SU_KHO (MaPhieu, LoaiPhieu, MaSP, SoLuong, DoiTac, GhiChu)
SELECT CONCAT(N'SEED-', RTRIM(MaSP)), N'Nhập kho', MaSP, SoLuongTon,
       N'Khởi tạo dữ liệu', N'Tồn đầu kỳ từ dữ liệu mẫu'
FROM TON_KHO
WHERE SoLuongTon > 0;

/* 8. Khach hang mau */
INSERT INTO KHACH_HANG (MaKH, HoTen, SDT, DiaChi, Email)
VALUES
('KH000001',N'Nguyễn Minh Anh','0901000001',N'Quận 1, TP. Hồ Chí Minh',N'minhanh@example.com'),
('KH000002',N'Trần Quốc Huy','0901000002',N'Quận Bình Thạnh, TP. Hồ Chí Minh',N'quochuy@example.com'),
('KH000003',N'Lê Hoàng Nam','0901000003',N'Quận Hải Châu, Đà Nẵng',N'hoangnam@example.com');
GO

/* 9. Gio hang mau */
INSERT INTO GIO_HANG (MaGioHang, MaKH, NgayTao, NgayCapNhat)
VALUES
('GH000001','KH000001','2026-09-28T10:00:00','2026-09-30T09:00:00'),
('GH000002','KH000002','2026-09-29T11:30:00','2026-09-30T14:00:00'),
('GH000003','KH000003','2026-09-30T08:00:00',NULL);
GO

INSERT INTO CHI_TIET_GIO_HANG (MaGioHang, MaSP, SoLuong)
VALUES
('GH000001','SP000004',1),
('GH000001','SP000008',2),
('GH000002','SP000001',1),
('GH000003','SP000010',1);
GO

/* 10. Don hang mau */
INSERT INTO DON_HANG
(MaDH, MaKH, NgayLap, TrangThai, DiaChiGiaoHang)
VALUES
('DH000001','KH000001','2026-09-29T09:15:00',N'Đã xác nhận',N'Quận 1, TP. Hồ Chí Minh'),
('DH000002','KH000002','2026-09-30T10:20:00',N'Chờ xác nhận',N'Quận Bình Thạnh, TP. Hồ Chí Minh');
GO

INSERT INTO CHI_TIET_DON_HANG
(MaDH, MaSP, SoLuongDat, DonGia, TyLeGiamGia)
VALUES
('DH000001','SP000003',1,24999000,0),
('DH000001','SP000008',1,3790000,5),
('DH000002','SP000001',1,22572000,0),
('DH000002','SP000011',2,2690000,0);
GO

/* 11. Thanh toan mau */
INSERT INTO THANH_TOAN
(MaThanhToan, MaDH, NgayThanhToan, SoTienThanhToan, PhuongThucThanhToan, TrangThai)
VALUES
('TT000001','DH000001','2026-09-29T09:20:00',26894000,N'Chuyển khoản',N'Đã thanh toán');
GO

/* 12. Phieu nhap mau */
INSERT INTO PHIEU_NHAP (MaPN, MaNCC, MaKho, NgayNhap)
VALUES
('PN000001','NCC00003','KHO001','2026-09-25T08:30:00'),
('PN000002','NCC00004','KHO001','2026-09-27T09:00:00'),
('PN000003','NCC00005','KHO001','2026-09-28T13:30:00');
GO

INSERT INTO CHI_TIET_PHIEU_NHAP
(MaPN, MaSP, SoLuongNhap, DonGiaNhap)
VALUES
('PN000001','SP000004',10,22000000),
('PN000001','SP000005',5,30000000),
('PN000001','SP000006',10,7200000),
('PN000002','SP000007',10,8500000),
('PN000002','SP000008',20,3200000),
('PN000002','SP000009',8,10000000),
('PN000002','SP000010',10,1500000),
('PN000002','SP000011',20,2200000),
('PN000003','SP000015',5,21000000),
('PN000003','SP000016',5,23000000),
('PN000003','SP000017',5,0);
GO

/* 
   TEST QUERIES
    */

/* Q1: Danh sach san pham tieng Viet */
SELECT
    SP.MaSP,
    LSPNN.TenLoai,
    SPNN.TenSP,
    SP.GiaNiemYet,
    SP.GiaBan
FROM SAN_PHAM SP
JOIN SAN_PHAM_NGON_NGU SPNN
    ON SP.MaSP = SPNN.MaSP AND SPNN.MaNgonNgu = 'VI'
JOIN LOAI_SAN_PHAM_NGON_NGU LSPNN
    ON SP.MaLoai = LSPNN.MaLoai AND LSPNN.MaNgonNgu = 'VI';
GO

/* Q2: Danh sach san pham tieng Anh */
SELECT
    SP.MaSP,
    LSPNN.TenLoai,
    SPNN.TenSP,
    SP.GiaBan
FROM SAN_PHAM SP
JOIN SAN_PHAM_NGON_NGU SPNN
    ON SP.MaSP = SPNN.MaSP AND SPNN.MaNgonNgu = 'EN'
JOIN LOAI_SAN_PHAM_NGON_NGU LSPNN
    ON SP.MaLoai = LSPNN.MaLoai AND LSPNN.MaNgonNgu = 'EN';
GO

/* Q3: Ton kho */
SELECT
    K.TenKho,
    SP.MaSP,
    SPNN.TenSP,
    TK.SoLuongTon
FROM TON_KHO TK
JOIN KHO K ON TK.MaKho = K.MaKho
JOIN SAN_PHAM SP ON TK.MaSP = SP.MaSP
JOIN SAN_PHAM_NGON_NGU SPNN
    ON SP.MaSP = SPNN.MaSP AND SPNN.MaNgonNgu = 'VI'
ORDER BY TK.SoLuongTon ASC;
GO

/* Q4: Chi tiet don hang */
SELECT
    DH.MaDH,
    KH.HoTen,
    SPNN.TenSP,
    CT.SoLuongDat,
    CT.DonGia,
    CT.TyLeGiamGia,
    CT.DonGiaThucTe,
    CT.ThanhTien
FROM CHI_TIET_DON_HANG CT
JOIN DON_HANG DH ON CT.MaDH = DH.MaDH
JOIN KHACH_HANG KH ON DH.MaKH = KH.MaKH
JOIN SAN_PHAM_NGON_NGU SPNN
    ON CT.MaSP = SPNN.MaSP AND SPNN.MaNgonNgu = 'VI';
GO

/* Q5: Tong gia tri tung phieu nhap */
SELECT
    PN.MaPN,
    NCC.TenNCC,
    PN.NgayNhap,
    SUM(CT.ThanhTien) AS TongTienNhap
FROM PHIEU_NHAP PN
JOIN NHA_CUNG_CAP NCC ON PN.MaNCC = NCC.MaNCC
JOIN CHI_TIET_PHIEU_NHAP CT ON PN.MaPN = CT.MaPN
GROUP BY PN.MaPN, NCC.TenNCC, PN.NgayNhap
ORDER BY PN.NgayNhap DESC;
GO
