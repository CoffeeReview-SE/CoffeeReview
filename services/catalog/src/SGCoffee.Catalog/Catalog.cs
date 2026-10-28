using Npgsql;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{Environment.GetEnvironmentVariable("PORT") ?? "5101"}");
var cs = builder.Configuration.GetConnectionString("Supabase") ?? throw new InvalidOperationException("ConnectionStrings:Supabase missing");
builder.Services.AddSingleton(NpgsqlDataSource.Create(cs));
var app = builder.Build();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.Use(async (ctx, next) => {
    if (ctx.Request.Path == "/health") { await next(); return; }
    var expected = app.Configuration["Gateway:SharedKey"];
    var supplied = ctx.Request.Headers["X-Gateway-Key"].ToString();
    if (string.IsNullOrEmpty(expected) || supplied.Length != expected.Length ||
        !CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(supplied), Encoding.UTF8.GetBytes(expected))) {
        ctx.Response.StatusCode = 401; return;
    }
    await next();
});

app.MapGet("/admin/brands", async (NpgsqlDataSource db) => {
    const string sql = """SELECT b.brand_id, b.brand_name, b.description, b.logo_url, b.website_url, b.is_active, COUNT(br.branch_id)::int AS branches FROM brand b LEFT JOIN branch br ON br.brand_id=b.brand_id GROUP BY b.brand_id ORDER BY b.brand_id DESC""";
    await using var cmd=db.CreateCommand(sql); await using var r=await cmd.ExecuteReaderAsync(); var list=new List<object>();
    while(await r.ReadAsync()) list.Add(new { id=r.GetInt64(0), name=r.GetString(1), description=r.IsDBNull(2)?"":r.GetString(2), logoUrl=r.IsDBNull(3)?"":r.GetString(3), websiteUrl=r.IsDBNull(4)?"":r.GetString(4), isActive=r.GetBoolean(5), branches=r.GetInt32(6) });
    return Results.Ok(list);
});
app.MapPost("/admin/brands", async (BrandInput input,NpgsqlDataSource db) => {
    if(string.IsNullOrWhiteSpace(input.Name)||input.Name.Length>160) return Results.BadRequest("Invalid brand name");
    await using var cmd=db.CreateCommand("INSERT INTO brand(brand_name,description,logo_url,website_url) VALUES (@name,@desc,@logo,@web) RETURNING brand_id");
    cmd.Parameters.AddWithValue("name",input.Name.Trim()); cmd.Parameters.AddWithValue("desc",(object?)input.Description??DBNull.Value);cmd.Parameters.AddWithValue("logo",(object?)input.LogoUrl??DBNull.Value);cmd.Parameters.AddWithValue("web",(object?)input.WebsiteUrl??DBNull.Value);
    try { return Results.Created("/admin/brands",new {id=(long)(await cmd.ExecuteScalarAsync())!}); } catch(PostgresException ex) when(ex.SqlState=="23505") {return Results.Conflict("Brand already exists");}
});
app.MapPut("/admin/brands/{id:long}",async (long id,BrandInput input,NpgsqlDataSource db)=>{
    if(string.IsNullOrWhiteSpace(input.Name)||input.Name.Length>160) return Results.BadRequest("Invalid brand name");
    await using var cmd=db.CreateCommand("UPDATE brand SET brand_name=@name,description=@desc,logo_url=@logo,website_url=@web,is_active=@active,updated_at=now() WHERE brand_id=@id");
    cmd.Parameters.AddWithValue("id",id);cmd.Parameters.AddWithValue("name",input.Name.Trim());cmd.Parameters.AddWithValue("desc",(object?)input.Description??DBNull.Value);cmd.Parameters.AddWithValue("logo",(object?)input.LogoUrl??DBNull.Value);cmd.Parameters.AddWithValue("web",(object?)input.WebsiteUrl??DBNull.Value);cmd.Parameters.AddWithValue("active",input.IsActive);
    try{return await cmd.ExecuteNonQueryAsync()==0?Results.NotFound():Results.NoContent();}catch(PostgresException ex) when(ex.SqlState=="23505"){return Results.Conflict("Brand already exists");}
});
app.MapDelete("/admin/brands/{id:long}",async(long id,NpgsqlDataSource db)=>{
    await using var cmd=db.CreateCommand("UPDATE brand SET is_active=false,updated_at=now() WHERE brand_id=@id");cmd.Parameters.AddWithValue("id",id);return await cmd.ExecuteNonQueryAsync()==0?Results.NotFound():Results.NoContent();
});
app.MapGet("/admin/branches",async(NpgsqlDataSource db)=>{
    await using var cmd=db.CreateCommand("SELECT br.branch_id,br.brand_id,COALESCE(br.branch_name,''),br.address,br.is_active,b.brand_name,COALESCE(br.phone,'') FROM branch br JOIN brand b ON b.brand_id=br.brand_id ORDER BY br.branch_id DESC");
    await using var r=await cmd.ExecuteReaderAsync();var list=new List<object>();while(await r.ReadAsync())list.Add(new{id=r.GetInt64(0),brandId=r.GetInt64(1),name=r.GetString(2),address=r.GetString(3),isActive=r.GetBoolean(4),brand=r.GetString(5),phone=r.GetString(6)});return Results.Ok(list);
});
app.MapPost("/admin/branches",async(BranchInput input,NpgsqlDataSource db)=>{
    if(input.BrandId<=0||string.IsNullOrWhiteSpace(input.Address)||input.Address.Length>2000||input.Name?.Length>180)return Results.BadRequest("Invalid branch data");
    await using var cmd=db.CreateCommand("INSERT INTO branch(brand_id,branch_name,address,phone) VALUES (@brand,@name,@addr,@phone) RETURNING branch_id");
    cmd.Parameters.AddWithValue("brand",input.BrandId);cmd.Parameters.AddWithValue("name",(object?)input.Name??DBNull.Value);cmd.Parameters.AddWithValue("addr",input.Address.Trim());cmd.Parameters.AddWithValue("phone",(object?)input.Phone??DBNull.Value);
    try{return Results.Created("/admin/branches",new{id=(long)(await cmd.ExecuteScalarAsync())!});}catch(PostgresException ex) when(ex.SqlState=="23503"){return Results.BadRequest("Brand does not exist");}
});
app.MapPut("/admin/branches/{id:long}",async(long id,BranchInput input,NpgsqlDataSource db)=>{
    if(input.BrandId<=0||string.IsNullOrWhiteSpace(input.Address)||input.Address.Length>2000||input.Name?.Length>180)return Results.BadRequest("Invalid branch data");
    await using var cmd=db.CreateCommand("UPDATE branch SET brand_id=@brand,branch_name=@name,address=@addr,phone=@phone,is_active=@active,updated_at=now() WHERE branch_id=@id");
    cmd.Parameters.AddWithValue("id",id);cmd.Parameters.AddWithValue("brand",input.BrandId);cmd.Parameters.AddWithValue("name",(object?)input.Name??DBNull.Value);cmd.Parameters.AddWithValue("addr",input.Address.Trim());cmd.Parameters.AddWithValue("phone",(object?)input.Phone??DBNull.Value);cmd.Parameters.AddWithValue("active",input.IsActive);
    try{return await cmd.ExecuteNonQueryAsync()==0?Results.NotFound():Results.NoContent();}catch(PostgresException ex) when(ex.SqlState=="23503"){return Results.BadRequest("Brand does not exist");}
});
app.MapDelete("/admin/branches/{id:long}",async(long id,NpgsqlDataSource db)=>{
    await using var cmd=db.CreateCommand("UPDATE branch SET is_active=false,updated_at=now() WHERE branch_id=@id");cmd.Parameters.AddWithValue("id",id);return await cmd.ExecuteNonQueryAsync()==0?Results.NotFound():Results.NoContent();
});
// Public customer endpoints read only active records from Supabase.
app.MapGet("/brands", async (NpgsqlDataSource db, CancellationToken ct) =>
{
    const string sql = """
        SELECT b.brand_id, b.brand_name, COALESCE(b.description, ''), COALESCE(b.logo_url, ''),
               COALESCE(b.website_url, ''), b.description_language_code,
               COUNT(br.branch_id)::int AS branch_count
        FROM brand b
        LEFT JOIN branch br ON br.brand_id = b.brand_id AND br.is_active
        WHERE b.is_active
        GROUP BY b.brand_id
        ORDER BY b.brand_name
        LIMIT 200
        """;
    await using var cmd = db.CreateCommand(sql);
    await using var reader = await cmd.ExecuteReaderAsync(ct);
    var brands = new List<object>();
    while (await reader.ReadAsync(ct))
        brands.Add(new
        {
            id = reader.GetInt64(0), name = reader.GetString(1), description = reader.GetString(2),
            logo = reader.GetString(3), website = reader.GetString(4),
            descriptionLanguageCode = reader.IsDBNull(5) ? null : reader.GetString(5),
            branchCount = reader.GetInt32(6)
        });
    return Results.Ok(brands);
});

app.MapGet("/branches", async (NpgsqlDataSource db, CancellationToken ct) =>
{
    const string sql = """
        SELECT br.branch_id, br.brand_id, b.brand_name, COALESCE(br.branch_name, b.brand_name),
               br.address, br.latitude, br.longitude, COALESCE(br.phone, '')
        FROM branch br JOIN brand b ON b.brand_id = br.brand_id
        WHERE b.is_active AND br.is_active
        ORDER BY b.brand_name, br.branch_id
        LIMIT 1000
        """;
    await using var cmd = db.CreateCommand(sql);
    await using var reader = await cmd.ExecuteReaderAsync(ct);
    var branches = new List<object>();
    while (await reader.ReadAsync(ct))
        branches.Add(new
        {
            id = reader.GetInt64(0), brandId = reader.GetInt64(1), brand = reader.GetString(2),
            name = reader.GetString(3), address = reader.GetString(4),
            lat = reader.IsDBNull(5) ? (double?)null : reader.GetDouble(5),
            lng = reader.IsDBNull(6) ? (double?)null : reader.GetDouble(6), phone = reader.GetString(7)
        });
    return Results.Ok(branches);
});

// Read public brand details and verified active branches from Supabase.
app.MapGet("/brands/{id:long}", async (long id, NpgsqlDataSource db, CancellationToken ct) =>
{
    long brandId;
    string name, description, logo, website;
    string? descriptionLanguageCode;
    long branchCount;
    await using (var cmd = db.CreateCommand("""
        SELECT b.brand_id, b.brand_name, COALESCE(b.description,''), COALESCE(b.logo_url,''),
          COALESCE(b.website_url,''), b.description_language_code,
          (SELECT COUNT(*) FROM branch br WHERE br.brand_id=b.brand_id AND br.is_active)
        FROM brand b WHERE b.brand_id=@id AND b.is_active
        """))
    {
        cmd.Parameters.AddWithValue("id", id);
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct)) return Results.NotFound();
        brandId = reader.GetInt64(0); name = reader.GetString(1); description = reader.GetString(2);
        logo = reader.GetString(3); website = reader.GetString(4);
        descriptionLanguageCode = reader.IsDBNull(5) ? null : reader.GetString(5);
        branchCount = reader.GetInt64(6);
    }

    var branches = new List<object>();
    await using (var cmd = db.CreateCommand("""
        SELECT branch_id, COALESCE(branch_name, ''), address, phone, latitude, longitude, opening_hours::text
        FROM branch WHERE brand_id=@id AND is_active ORDER BY branch_id LIMIT 100
        """))
    {
        cmd.Parameters.AddWithValue("id", brandId);
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
            branches.Add(new
            {
                id = reader.GetInt64(0), name = reader.GetString(1), address = reader.GetString(2),
                phone = reader.IsDBNull(3) ? "" : reader.GetString(3),
                latitude = reader.IsDBNull(4) ? (double?)null : reader.GetDouble(4),
                longitude = reader.IsDBNull(5) ? (double?)null : reader.GetDouble(5),
                openingHours = reader.IsDBNull(6) ? null : reader.GetString(6)
            });
    }

    return Results.Ok(new { id = brandId, name, description, logo, website, descriptionLanguageCode,
        branchCount, audio = "", branches });
});
app.Run();
record BrandInput(string Name,string? Description,string? LogoUrl,string? WebsiteUrl,bool IsActive=true);
record BranchInput(long BrandId,string? Name,string Address,string? Phone,bool IsActive=true);
