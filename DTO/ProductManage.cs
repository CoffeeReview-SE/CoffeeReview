using System;

namespace SmartShop.DTO
{
    public class ProductManage
    {
        // Thuộc tính 
        public string MaSP { get; set; } = string.Empty;
        public string MaLoai { get; set; } = string.Empty;
        public string TenSP { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public string DonViTinh { get; set; } = string.Empty;
        public int GiaNiemYet { get; set; }
        public int GiaBan { get; set; }
        public string TrangThai { get; set; } = string.Empty;

        // Constructor không tham số
        public ProductManage()
        {
        }

        // Constructor có tham số
        public ProductManage(string maSP, string maLoai, string tenSP, string moTa, string donViTinh, int giaNiemYet, int giaBan, string trangThai)
        {
            MaSP = maSP;
            MaLoai = maLoai;
            TenSP = tenSP;
            MoTa = moTa;
            DonViTinh = donViTinh;
            GiaNiemYet = giaNiemYet;
            GiaBan = giaBan;
            TrangThai = trangThai;
        }
    }
}