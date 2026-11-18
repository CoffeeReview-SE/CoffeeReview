using Npgsql;

static class BranchMediaEndpoints
{
    public static void MapBranchMedia(this WebApplication app)
    {
        app.MapGet("/admin/submissions/branch-media", async (string ids, NpgsqlDataSource db, ImageFileStore files, CancellationToken ct) => {
            var requested = ids.Split(',');
            if (requested.Length > 1000 || requested.Any(value => !long.TryParse(value, out var id) || id <= 0)) return Results.BadRequest();
            await using var cmd = db.CreateCommand("SELECT branch_id,is_active FROM branch WHERE branch_id=ANY(@ids)");
            cmd.Parameters.AddWithValue("ids", requested.Select(long.Parse).Distinct().ToArray());
            var branches = new List<(long Id, bool Active)>();
            await using (var reader = await cmd.ExecuteReaderAsync(ct))
                while (await reader.ReadAsync(ct)) branches.Add((reader.GetInt64(0), reader.GetBoolean(1)));
            var result = new Dictionary<long, BranchMedia>();
            foreach (var branch in branches) result[branch.Id] = WithStatus(await files.ReadBranchMediaAsync(branch.Id, ct), branch.Active);
            return Results.Ok(result);
        });
        app.MapPut("/admin/submissions/branch-media/{id:long}", async (long id, BranchMedia media, NpgsqlDataSource db, ImageFileStore files, CancellationToken ct) => {
            await using var cmd = db.CreateCommand("SELECT br.is_active,b.brand_name FROM branch br JOIN brand b ON b.brand_id=br.brand_id WHERE br.branch_id=@id");
            cmd.Parameters.AddWithValue("id", id);
            bool active;
            string brandName;
            await using (var reader = await cmd.ExecuteReaderAsync(ct))
            {
                if (!await reader.ReadAsync(ct)) return Results.NotFound();
                active = reader.GetBoolean(0); brandName = reader.GetString(1);
            }
            if ((media.Status == "ACTIVE") != active) return Results.Conflict(new { error = "Trạng thái chi nhánh đã thay đổi. Tải lại danh sách để kiểm tra." });
            try { return Results.Ok(await files.SaveBranchMediaAsync(id, media, brandName, ct)); }
            catch (BranchMediaConflictException) { return Results.Conflict(new { error = "Ảnh hoặc trạng thái đã được sửa ở phiên khác. Đóng biểu mẫu và tải lại danh sách để kiểm tra." }); }
            catch (ArgumentException) { return Results.BadRequest(new { error = "Kiểm tra định dạng ảnh, dung lượng tối đa 2 MB và trạng thái chi nhánh." }); }
            catch (Exception error) when (error is IOException or UnauthorizedAccessException)
            { return Results.Json(new { error = "Chưa lưu được ảnh chi nhánh. Vui lòng thử lại." }, statusCode: 503); }
        });
        app.MapGet("/images/branches/{id:long}", async (long id, NpgsqlDataSource db, ImageFileStore files, CancellationToken ct) => {
            await using var cmd = db.CreateCommand("SELECT EXISTS(SELECT 1 FROM branch br JOIN brand b ON b.brand_id=br.brand_id WHERE br.branch_id=@id AND br.is_active AND b.is_active)");
            cmd.Parameters.AddWithValue("id", id);
            if (await cmd.ExecuteScalarAsync(ct) is not true) return Results.NotFound();
            return Results.Ok(await files.ReadBranchMediaAsync(id, ct));
        });
    }

    static BranchMedia WithStatus(BranchMedia media, bool active) => media with {
        Status = active ? "ACTIVE" : "TEMPORARILY_CLOSED"
    };
}
