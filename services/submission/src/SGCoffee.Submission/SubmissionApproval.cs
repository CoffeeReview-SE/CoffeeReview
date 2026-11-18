using Npgsql;
using NpgsqlTypes;
using System.Text.Json;

static class SubmissionApproval
{
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static async Task<IResult> Decide(long id, DecisionInput decision, NpgsqlDataSource db, ImageFileStore images, CancellationToken ct)
    {
        if (decision.Status is not ("APPROVED" or "REJECTED")) return Results.BadRequest(new { error = "Quyết định không hợp lệ." });
        try { return await SaveDecision(id, decision.Status, db, images, ct); }
        catch (BranchMediaConflictException) { return Results.Conflict(new { error = "Ảnh chi nhánh đã thay đổi. Tải lại đề xuất và thử lại." }); }
        catch (PostgresException error) when (error.SqlState == "23505")
        { return Results.Conflict(new { error = "Thương hiệu vừa được tạo ở phiên khác. Tải lại và duyệt lại đề xuất." }); }
        catch (ArgumentException) { return Results.BadRequest(new { error = "Ảnh đề xuất không hợp lệ hoặc không còn tồn tại. Cần bổ sung ảnh trước khi duyệt." }); }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException)
        { return Results.Json(new { error = "Chưa lưu được ảnh. Đề xuất chưa hoàn tất duyệt, vui lòng thử lại." }, statusCode: 503); }
    }

    static async Task<IResult> SaveDecision(long id, string status, NpgsqlDataSource db, ImageFileStore images, CancellationToken ct)
    {
        await using var connection = await db.OpenConnectionAsync(ct);
        await using var transaction = await connection.BeginTransactionAsync(ct);
        SuggestionInput suggestion;
        await using (var read = new NpgsqlCommand("SELECT data_json::text,suggested_name,suggested_address,status,target_type FROM submission WHERE submission_id=@id FOR UPDATE", connection, transaction))
        {
            read.Parameters.AddWithValue("id", id);
            await using var reader = await read.ExecuteReaderAsync(ct);
            if (!await reader.ReadAsync(ct)) return Results.NotFound();
            var previousStatus = reader.GetString(3);
            if (previousStatus == status) return Results.NoContent();
            if (previousStatus != "PENDING") return Results.Conflict(new { error = "Đề xuất đã được xử lý." });
            if (status == "REJECTED") suggestion = new();
            else
            {
                if (reader.GetString(4) is not ("BRAND" or "BRANCH")) return Results.BadRequest(new { error = "Loại đề xuất này chưa hỗ trợ tự thêm vào danh mục." });
                try { suggestion = JsonSerializer.Deserialize<SuggestionInput>(reader.GetString(0), Json) ?? new(); }
                catch (JsonException) { return Results.BadRequest(new { error = "Dữ liệu đề xuất không hợp lệ." }); }
                suggestion = suggestion with { BrandName = reader.IsDBNull(1) ? null : reader.GetString(1), Address = reader.IsDBNull(2) ? null : reader.GetString(2) };
            }
        }

        long? brandId = null;
        long? branchId = null;
        if (status == "APPROVED")
        {
            // Serialize same-name publications while retaining the submission row lock for safe retries.
            await using (var gate = new NpgsqlCommand("SELECT pg_advisory_xact_lock(hashtextextended(lower(btrim(@name)),0))", connection, transaction))
            {
                gate.Parameters.AddWithValue("name", suggestion.BrandName ?? "");
                await gate.ExecuteNonQueryAsync(ct);
            }
            var brandName = suggestion.BrandName?.Trim() ?? "";
            await using (var find = new NpgsqlCommand("SELECT brand_id,brand_name,is_active FROM brand WHERE lower(btrim(brand_name))=lower(btrim(@name)) ORDER BY brand_id LIMIT 1 FOR UPDATE", connection, transaction))
            {
                find.Parameters.AddWithValue("name", brandName);
                await using var reader = await find.ExecuteReaderAsync(ct);
                if (await reader.ReadAsync(ct))
                {
                    if (!reader.GetBoolean(2)) return Results.Conflict(new { error = "Thương hiệu đang tạm ngưng. Bật lại thương hiệu trước khi thêm chi nhánh." });
                    brandId = reader.GetInt64(0); brandName = reader.GetString(1);
                }
            }
            var errors = SuggestionValidation.Validate(suggestion, !brandId.HasValue);
            if (errors.Count > 0) return Results.BadRequest(new { error = "Thông tin đề xuất chưa đầy đủ. Cần bổ sung trước khi duyệt.", errors });

            var storedImages = new Dictionary<string, string>();
            foreach (var (field, value, kind) in new[] {
                ("logoUrl", suggestion.LogoUrl, "logo"), ("coverUrl", suggestion.CoverUrl, "cover"), ("menuImageUrl", suggestion.MenuImageUrl, "menu")
            })
            {
                var url = await images.StoreAsync(value, brandName, kind, ct);
                if (!string.IsNullOrWhiteSpace(url)) storedImages[field] = url;
            }
            if (!brandId.HasValue)
            {
                await using var create = new NpgsqlCommand("""
                    INSERT INTO brand(brand_name,type,description,logo_url,website_url,description_language_code)
                    VALUES(@name,@type,@description,@logo,@website,'vi') RETURNING brand_id
                    """, connection, transaction);
                create.Parameters.AddWithValue("name", brandName); create.Parameters.AddWithValue("type", suggestion.Type!.Trim());
                create.Parameters.AddWithValue("description", suggestion.Description!.Trim());
                create.Parameters.AddWithValue("logo", storedImages["logoUrl"]); create.Parameters.AddWithValue("website", suggestion.WebsiteUrl!.Trim());
                brandId = (long)(await create.ExecuteScalarAsync(ct))!;
            }
            await using (var duplicate = new NpgsqlCommand("SELECT branch_id FROM branch WHERE brand_id=@brand AND regexp_replace(lower(address),'[^[:alnum:]]','','g')=regexp_replace(lower(@address),'[^[:alnum:]]','','g') LIMIT 1", connection, transaction))
            {
                duplicate.Parameters.AddWithValue("brand", brandId.Value); duplicate.Parameters.AddWithValue("address", suggestion.Address!.Trim());
                if (await duplicate.ExecuteScalarAsync(ct) is long) return Results.Conflict(new { error = "Chi nhánh có địa chỉ này đã tồn tại. Kiểm tra trong Quản lý chi nhánh trước khi duyệt." });
            }
            await using (var create = new NpgsqlCommand("""
                INSERT INTO branch(brand_id,branch_name,address,phone,latitude,longitude,opening_hours)
                VALUES(@brand,@name,@address,@phone,@lat,@lng,@hours::jsonb) RETURNING branch_id
                """, connection, transaction))
            {
                create.Parameters.AddWithValue("brand", brandId.Value); create.Parameters.AddWithValue("name", suggestion.BranchName!.Trim());
                create.Parameters.AddWithValue("address", suggestion.Address!.Trim()); create.Parameters.AddWithValue("phone", suggestion.BranchPhone!.Trim());
                create.Parameters.AddWithValue("lat", suggestion.Latitude!.Value); create.Parameters.AddWithValue("lng", suggestion.Longitude!.Value);
                create.Parameters.AddWithValue("hours", JsonSerializer.Serialize(suggestion.OpeningHours!.Trim()));
                branchId = (long)(await create.ExecuteScalarAsync(ct))!;
            }
            // Persist image references before commit; a failed file write rolls back catalog publication.
            await images.SaveBranchMediaAsync(branchId.Value, new BranchMedia("ACTIVE", storedImages), brandName, ct);
        }

        await using var update = new NpgsqlCommand("UPDATE submission SET status=@status,processed_at=now(),created_brand_id=@brand,created_branch_id=@branch WHERE submission_id=@id", connection, transaction);
        update.Parameters.AddWithValue("id", id); update.Parameters.AddWithValue("status", status);
        update.Parameters.AddWithValue("brand", NpgsqlDbType.Bigint, (object?)brandId ?? DBNull.Value);
        update.Parameters.AddWithValue("branch", NpgsqlDbType.Bigint, (object?)branchId ?? DBNull.Value);
        await update.ExecuteNonQueryAsync(ct);
        await transaction.CommitAsync(ct);
        return Results.NoContent();
    }
}
