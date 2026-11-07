using MySql.Data.MySqlClient;
using SmartShop.DTO;

namespace SmartShop.DAO
{
    public class ProductManageDAO
    {
        private static string ConnectionString =>
            Environment.GetEnvironmentVariable("SMARTSHOP_MYSQL_CONNECTION")
            ?? throw new InvalidOperationException("Chưa cấu hình SMARTSHOP_MYSQL_CONNECTION.");

        private static MySqlConnection CreateConnection() => new(ConnectionString);

        public List<ProductManage> ReadData()
        {
            List<ProductManage> product = new List<ProductManage>();
            const string query = "SELECT MaSP, MaLoai, TenSP, MoTa, DonViTinh, GiaNiemYet, GiaBan, TrangThai FROM Product";
            using var connection = CreateConnection();
            connection.Open();
            using var command = new MySqlCommand(query, connection);
            using MySqlDataReader reader = command.ExecuteReader();
            while (reader.Read())
            {
                string maSP = reader.GetString("MaSP");
                string maLoai = reader.GetString("MaLoai");
                string tenSP = reader.GetString("TenSP");
                string moTa = reader.IsDBNull(reader.GetOrdinal("MoTa")) ? string.Empty : reader.GetString("MoTa");
                string donViTinh = reader.GetString("DonViTinh");
                int giaNiemYet = reader.GetInt32("GiaNiemYet");
                int giaBan = reader.GetInt32("GiaBan");
                string trangThai = reader.GetString("TrangThai");

                ProductManage pm = new ProductManage(maSP, maLoai, tenSP, moTa, donViTinh, giaNiemYet, giaBan, trangThai);
                product.Add(pm);
            }
            return product;
        }

        public void Update(ProductManage pm)
        {
            const string query = "UPDATE Product SET MaLoai=@maLoai, TenSP=@tenSP, MoTa=@moTa, DonViTinh=@donViTinh, GiaNiemYet=@giaNiemYet, GiaBan=@giaBan, TrangThai=@trangThai WHERE MaSP=@maSP";
            using var connection = CreateConnection();
            connection.Open();
            using var command = new MySqlCommand(query, connection);

            command.Parameters.AddWithValue("@maLoai", pm.MaLoai);
            command.Parameters.AddWithValue("@tenSP", pm.TenSP);
            command.Parameters.AddWithValue("@moTa", pm.MoTa);
            command.Parameters.AddWithValue("@donViTinh", pm.DonViTinh);
            command.Parameters.AddWithValue("@giaNiemYet", pm.GiaNiemYet);
            command.Parameters.AddWithValue("@giaBan", pm.GiaBan);
            command.Parameters.AddWithValue("@trangThai", pm.TrangThai);
            command.Parameters.AddWithValue("@maSP", pm.MaSP);

            if (command.ExecuteNonQuery() == 0)
                throw new InvalidOperationException("Không tìm thấy sản phẩm để cập nhật.");
        }

        public void Insert(ProductManage pm)
        {
            const string query = "INSERT INTO Product(MaSP, MaLoai, TenSP, MoTa, DonViTinh, GiaNiemYet, GiaBan, TrangThai) VALUES(@maSP, @maLoai, @tenSP, @moTa, @donViTinh, @giaNiemYet, @giaBan, @trangThai)";
            using var connection = CreateConnection();
            connection.Open();
            using var command = new MySqlCommand(query, connection);

            command.Parameters.AddWithValue("@maSP", pm.MaSP);
            command.Parameters.AddWithValue("@maLoai", pm.MaLoai);
            command.Parameters.AddWithValue("@tenSP", pm.TenSP);
            command.Parameters.AddWithValue("@moTa", pm.MoTa);
            command.Parameters.AddWithValue("@donViTinh", pm.DonViTinh);
            command.Parameters.AddWithValue("@giaNiemYet", pm.GiaNiemYet);
            command.Parameters.AddWithValue("@giaBan", pm.GiaBan);
            command.Parameters.AddWithValue("@trangThai", pm.TrangThai);

            if (command.ExecuteNonQuery() == 0)
                throw new InvalidOperationException("Không thể thêm sản phẩm.");
        }

        public bool CheckId(string ma)
        {
            const string query = "SELECT COUNT(*) FROM Product WHERE MaSP = @ma";
            using var connection = CreateConnection();
            connection.Open();
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@ma", ma);
            int count = Convert.ToInt32(command.ExecuteScalar());
            return count > 0;
        }
    }
}