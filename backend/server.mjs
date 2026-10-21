import { createServer } from "node:http";
import sql from "mssql";

const port = Number(process.env.PORT || 3333);
const apiKey = process.env.GEMINI_API_KEY?.trim();
const model = process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest";
const maxBodyBytes = 64 * 1024; // Đã sửa lỗi ngắt dòng
const recentRequests = new Map();
let dbPoolPromise;

function getDbPool() {
  const server = process.env.DB_SERVER?.trim();
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD;
  const trustedConnection = process.env.DB_TRUSTED_CONNECTION === "true";
  if (!server || (!trustedConnection && (!user || !password))) {
    throw new Error("Thiếu cấu hình SQL Server trong backend/.env. Cần DB_SERVER và xác thực Windows hoặc DB_USER/DB_PASSWORD.");
  }
  if (!dbPoolPromise) {
    dbPoolPromise = (async () => {
      const driver = trustedConnection
        ? (await import("mssql/msnodesqlv8.js")).default
        : sql;
      const config = {
        server,
        ...(trustedConnection ? {} : { user, password }),
        database: process.env.DB_NAME?.trim() || "ElectronicCommerceDB",
        ...(!process.env.DB_INSTANCE && process.env.DB_PORT
          ? { port: Number(process.env.DB_PORT) }
          : {}),
        ...(trustedConnection && process.env.DB_ODBC_DRIVER?.trim()
          ? { driver: process.env.DB_ODBC_DRIVER.trim() }
          : {}),
        options: {
          encrypt: process.env.DB_ENCRYPT === "true",
          trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
          enableArithAbort: true,
          ...(trustedConnection ? { trustedConnection: true } : {}),
          ...(process.env.DB_INSTANCE?.trim()
            ? { instanceName: process.env.DB_INSTANCE.trim() }
            : {}),
        },
        pool: { min: 0, max: 10, idleTimeoutMillis: 30_000 },
        connectionTimeout: 10_000,
        requestTimeout: 15_000,
      };
      return new driver.ConnectionPool(config).connect();
    })().catch((error) => {
      dbPoolPromise = undefined;
      throw error;
    });
  }
  return dbPoolPromise;
}

function getLanguage(url) {
  return url.searchParams.get("lang")?.toUpperCase() === "EN" ? "EN" : "VI";
}

async function getProducts(language = "VI", includeInactive = false) {
  const pool = await getDbPool();
  const result = await pool.request()
    .input("language", sql.Char(2), language)
    .input("includeInactive", sql.Bit, includeInactive).query(`
    SELECT RTRIM(SP.MaSP) AS id,
      RTRIM(SP.MaLoai) AS categoryId,
      COALESCE(SPNN.TenSP, SPVI.TenSP, SPEN.TenSP, RTRIM(SP.MaSP)) AS name,
      COALESCE(SPNN.MoTa, SPVI.MoTa, SPEN.MoTa, N'') AS description,
      COALESCE(LSPNN.TenLoai, LSPVI.TenLoai, LSPEN.TenLoai, RTRIM(SP.MaLoai)) AS category,
      CONVERT(float, COALESCE(SP.GiaBan, SP.GiaNiemYet, 0)) AS price,
      COALESCE(TK.SoLuongTon, 0) AS stock,
      COALESCE(TK.MucTonToiThieu, 5) AS minimum,
      SP.TrangThai AS active,
      CASE WHEN SP.TrangThai = 0 THEN N'Ngừng bán'
        WHEN COALESCE(TK.SoLuongTon, 0) > 0 THEN N'Đang bán' ELSE N'Hết hàng' END AS status
    FROM SAN_PHAM SP
    LEFT JOIN SAN_PHAM_NGON_NGU SPNN ON SPNN.MaSP = SP.MaSP AND SPNN.MaNgonNgu = @language
    LEFT JOIN SAN_PHAM_NGON_NGU SPVI ON SPVI.MaSP = SP.MaSP AND SPVI.MaNgonNgu = 'VI'
    LEFT JOIN SAN_PHAM_NGON_NGU SPEN ON SPEN.MaSP = SP.MaSP AND SPEN.MaNgonNgu = 'EN'
    LEFT JOIN LOAI_SAN_PHAM_NGON_NGU LSPNN ON LSPNN.MaLoai = SP.MaLoai AND LSPNN.MaNgonNgu = @language
    LEFT JOIN LOAI_SAN_PHAM_NGON_NGU LSPVI ON LSPVI.MaLoai = SP.MaLoai AND LSPVI.MaNgonNgu = 'VI'
    LEFT JOIN LOAI_SAN_PHAM_NGON_NGU LSPEN ON LSPEN.MaLoai = SP.MaLoai AND LSPEN.MaNgonNgu = 'EN'
    OUTER APPLY (
      SELECT SUM(SoLuongTon) AS SoLuongTon, MAX(MucTonToiThieu) AS MucTonToiThieu
      FROM TON_KHO WHERE MaSP = SP.MaSP
    ) TK
    WHERE @includeInactive = 1 OR SP.TrangThai = 1
    ORDER BY SP.MaSP;
  `);
  return result.recordset;
}

async function getCategories(language = "VI") {
  const pool = await getDbPool();
  const result = await pool.request().input("language", sql.Char(2), language).query(`
    SELECT RTRIM(L.MaLoai) AS id,
      COALESCE(T.TenLoai, TVI.TenLoai, TEN.TenLoai, RTRIM(L.MaLoai)) AS name,
      COALESCE(T.MoTa, TVI.MoTa, TEN.MoTa, N'') AS description,
      (SELECT COUNT(*) FROM SAN_PHAM SP WHERE SP.MaLoai = L.MaLoai AND SP.TrangThai = 1) AS productCount
    FROM LOAI_SAN_PHAM L
    LEFT JOIN LOAI_SAN_PHAM_NGON_NGU T ON T.MaLoai = L.MaLoai AND T.MaNgonNgu = @language
    LEFT JOIN LOAI_SAN_PHAM_NGON_NGU TVI ON TVI.MaLoai = L.MaLoai AND TVI.MaNgonNgu = 'VI'
    LEFT JOIN LOAI_SAN_PHAM_NGON_NGU TEN ON TEN.MaLoai = L.MaLoai AND TEN.MaNgonNgu = 'EN'
    WHERE L.TrangThai = 1 ORDER BY name;
  `);
  return result.recordset;
}

async function saveProduct(input, id) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const category = typeof input?.category === "string" ? input.category.trim() : "";
  const price = Number(input?.price);
  const stock = Number(input?.stock);
  let minimum = Number.isInteger(input?.minimum) && input.minimum >= 0 ? input.minimum : undefined;
  if (!name || name.length > 200 || !category || category.length > 150 || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
    throw new Error("Thông tin sản phẩm không hợp lệ.");
  }
  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    let previousStock = 0;
    if (minimum === undefined && id) {
      const existingMinimum = await transaction.request().input("id", sql.Char(8), id)
        .query("SELECT COALESCE(MAX(MucTonToiThieu), 5) AS minimum FROM TON_KHO WHERE MaSP = @id");
      minimum = existingMinimum.recordset[0]?.minimum ?? 5;
    }
    minimum ??= 5;
    const categoryRow = await transaction.request().input("category", sql.NVarChar(150), category)
      .query(`SELECT TOP 1 L.MaLoai AS id FROM LOAI_SAN_PHAM L
        JOIN LOAI_SAN_PHAM_NGON_NGU T ON T.MaLoai = L.MaLoai AND T.MaNgonNgu = 'VI'
        WHERE T.TenLoai = @category AND L.TrangThai = 1`);
    let categoryId = categoryRow.recordset[0]?.id;
    if (!categoryId) {
      const last = await transaction.request().query(`SELECT MAX(TRY_CONVERT(int, RIGHT(MaLoai, 3))) AS lastId
        FROM LOAI_SAN_PHAM WHERE MaLoai LIKE 'CAT[0-9][0-9][0-9]'`);
      categoryId = `CAT${String((last.recordset[0]?.lastId || 0) + 1).padStart(3, "0")}`;
      await transaction.request().input("id", sql.Char(6), categoryId)
        .input("category", sql.NVarChar(150), category).query(`
          INSERT INTO LOAI_SAN_PHAM (MaLoai, TrangThai) VALUES (@id, 1);
          INSERT INTO LOAI_SAN_PHAM_NGON_NGU (MaLoai, MaNgonNgu, TenLoai, MoTa) VALUES (@id, 'VI', @category, N'');
        `);
    }
    let productId = id;
    if (!productId) {
      const max = await transaction.request().query(`SELECT ISNULL(MAX(TRY_CONVERT(int, SUBSTRING(MaSP, 3, 6))), 0) AS lastId FROM SAN_PHAM WITH (UPDLOCK, HOLDLOCK)`);
      productId = `SP${String(max.recordset[0].lastId + 1).padStart(6, "0")}`;
      const warehouse = await transaction.request().query("SELECT TOP 1 MaKho AS id FROM KHO ORDER BY MaKho");
      if (!warehouse.recordset[0]) throw new Error("Chưa có kho trong bảng KHO.");
      await transaction.request().input("id", sql.Char(8), productId)
        .input("categoryId", sql.Char(6), categoryId).input("price", sql.Decimal(18, 2), price)
        .input("name", sql.NVarChar(200), name).input("warehouse", sql.Char(6), warehouse.recordset[0].id)
        .input("stock", sql.Int, stock).input("minimum", sql.Int, minimum).query(`
          INSERT INTO SAN_PHAM (MaSP, MaLoai, DonViTinh, GiaNiemYet, GiaBan, TrangThai)
            VALUES (@id, @categoryId, N'Cái', @price, @price, 1);
          INSERT INTO SAN_PHAM_NGON_NGU (MaSP, MaNgonNgu, TenSP, MoTa) VALUES (@id, 'VI', @name, N'');
          INSERT INTO TON_KHO (MaKho, MaSP, SoLuongTon, MucTonToiThieu) VALUES (@warehouse, @id, @stock, @minimum);
        `);
      if (stock > 0) {
        await transaction.request().input("code", sql.NVarChar(32), createMovementId())
          .input("id", sql.Char(8), productId).input("quantity", sql.Int, stock).query(`
            INSERT INTO LICH_SU_KHO (MaPhieu, LoaiPhieu, MaSP, SoLuong, DoiTac, GhiChu)
            VALUES (@code, N'Nhập kho', @id, @quantity, N'Quản lý sản phẩm', N'Tồn ban đầu khi tạo sản phẩm');
          `);
      }
    } else {
      const existing = await transaction.request().input("id", sql.Char(8), productId)
        .query(`SELECT SP.MaSP, COALESCE((SELECT SUM(TK.SoLuongTon) FROM TON_KHO TK WITH (UPDLOCK, HOLDLOCK) WHERE TK.MaSP = SP.MaSP), 0) AS stock
          FROM SAN_PHAM SP WITH (UPDLOCK, HOLDLOCK) WHERE SP.MaSP = @id`);
      if (!existing.recordset[0]) throw new Error("Không tìm thấy sản phẩm.");
      previousStock = existing.recordset[0].stock;
      await transaction.request().input("id", sql.Char(8), productId)
        .input("categoryId", sql.Char(6), categoryId).input("price", sql.Decimal(18, 2), price)
        .input("name", sql.NVarChar(200), name).input("stock", sql.Int, stock)
        .input("minimum", sql.Int, minimum).query(`
          UPDATE SAN_PHAM SET MaLoai = @categoryId, GiaNiemYet = @price, GiaBan = @price, TrangThai = 1 WHERE MaSP = @id;
          UPDATE SAN_PHAM_NGON_NGU SET TenSP = @name WHERE MaSP = @id AND MaNgonNgu = 'VI';
          IF NOT EXISTS (SELECT 1 FROM SAN_PHAM_NGON_NGU WHERE MaSP = @id AND MaNgonNgu = 'VI')
            INSERT INTO SAN_PHAM_NGON_NGU (MaSP, MaNgonNgu, TenSP, MoTa) VALUES (@id, 'VI', @name, N'');
          DECLARE @warehouse CHAR(6) = (SELECT TOP 1 MaKho FROM KHO ORDER BY MaKho);
          UPDATE TON_KHO SET SoLuongTon = CASE WHEN MaKho = @warehouse THEN @stock ELSE 0 END,
            MucTonToiThieu = @minimum WHERE MaSP = @id;
          IF NOT EXISTS (SELECT 1 FROM TON_KHO WHERE MaSP = @id AND MaKho = @warehouse)
            INSERT INTO TON_KHO (MaKho, MaSP, SoLuongTon, MucTonToiThieu) VALUES (@warehouse, @id, @stock, @minimum);
        `);
      if (stock !== previousStock) {
        await transaction.request().input("code", sql.NVarChar(32), createMovementId())
          .input("type", sql.NVarChar(20), stock > previousStock ? "Nhập kho" : "Xuất kho")
          .input("id", sql.Char(8), productId).input("quantity", sql.Int, Math.abs(stock - previousStock)).query(`
            INSERT INTO LICH_SU_KHO (MaPhieu, LoaiPhieu, MaSP, SoLuong, DoiTac, GhiChu)
            VALUES (@code, @type, @id, @quantity, N'Quản lý sản phẩm', N'Điều chỉnh tồn từ màn sản phẩm');
          `);
      }
    }
    await transaction.commit();
    return (await getProducts("VI", true)).find((product) => product.id === productId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function removeProduct(id) {
  const pool = await getDbPool();
  const result = await pool.request().input("id", sql.Char(8), id).query("UPDATE SAN_PHAM SET TrangThai = 0 WHERE MaSP = @id");
  return result.rowsAffected[0] > 0;
}

async function saveCategory(input, id) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const description = typeof input?.description === "string" ? input.description.trim() : "";
  if (!name || name.length > 150 || description.length > 500) throw new Error("Thông tin danh mục không hợp lệ.");
  const pool = await getDbPool();
  if (!id) {
    const last = await pool.request().query(`SELECT MAX(TRY_CONVERT(int, RIGHT(MaLoai, 3))) AS lastId FROM LOAI_SAN_PHAM WHERE MaLoai LIKE 'CAT[0-9][0-9][0-9]'`);
    const categoryId = `CAT${String((last.recordset[0]?.lastId || 0) + 1).padStart(3, "0")}`;
    await pool.request().input("id", sql.Char(6), categoryId).input("name", sql.NVarChar(150), name)
      .input("description", sql.NVarChar(500), description).query(`
        INSERT INTO LOAI_SAN_PHAM (MaLoai, TrangThai) VALUES (@id, 1);
        INSERT INTO LOAI_SAN_PHAM_NGON_NGU (MaLoai, MaNgonNgu, TenLoai, MoTa) VALUES (@id, 'VI', @name, @description);
      `);
    return categoryId;
  }
  const result = await pool.request().input("id", sql.Char(6), id).input("name", sql.NVarChar(150), name)
    .input("description", sql.NVarChar(500), description).query(`
      UPDATE LOAI_SAN_PHAM SET TrangThai = 1 WHERE MaLoai = @id;
      UPDATE LOAI_SAN_PHAM_NGON_NGU SET TenLoai = @name, MoTa = @description WHERE MaLoai = @id AND MaNgonNgu = 'VI';
      IF @@ROWCOUNT = 0 INSERT INTO LOAI_SAN_PHAM_NGON_NGU (MaLoai, MaNgonNgu, TenLoai, MoTa) VALUES (@id, 'VI', @name, @description);
      SELECT @@ROWCOUNT AS saved;
    `);
  if (!result.recordset) throw new Error("Không tìm thấy danh mục.");
  return id;
}

async function removeCategory(id) {
  const pool = await getDbPool();
  const result = await pool.request().input("id", sql.Char(6), id)
    .query("UPDATE LOAI_SAN_PHAM SET TrangThai = 0 WHERE MaLoai = @id");
  return result.rowsAffected[0] > 0;
}

async function getStockData(language = "VI") {
  const products = await getProducts(language, true);
  const pool = await getDbPool();
  const movements = await pool.request().input("language", sql.Char(2), language).query(`
    SELECT LTRIM(RTRIM(MaPhieu)) AS id, LoaiPhieu AS type, LTRIM(RTRIM(S.MaSP)) AS productId,
      COALESCE(SN.TenSP, SV.TenSP, LTRIM(RTRIM(S.MaSP))) AS productName, SoLuong AS quantity,
      DoiTac AS partner, GhiChu AS note, CONVERT(varchar(16), NgayTao, 120) AS date
    FROM LICH_SU_KHO M JOIN SAN_PHAM S ON S.MaSP = M.MaSP
    LEFT JOIN SAN_PHAM_NGON_NGU SN ON SN.MaSP = S.MaSP AND SN.MaNgonNgu = @language
    LEFT JOIN SAN_PHAM_NGON_NGU SV ON SV.MaSP = S.MaSP AND SV.MaNgonNgu = 'VI'
    UNION ALL
    SELECT RTRIM(PN.MaPN), N'Nhập kho', RTRIM(S.MaSP), COALESCE(SN.TenSP, SV.TenSP, RTRIM(S.MaSP)),
      CT.SoLuongNhap, NCC.TenNCC, N'Phiếu nhập từ database', CONVERT(varchar(16), PN.NgayNhap, 120)
    FROM PHIEU_NHAP PN JOIN CHI_TIET_PHIEU_NHAP CT ON CT.MaPN = PN.MaPN
    JOIN SAN_PHAM S ON S.MaSP = CT.MaSP JOIN NHA_CUNG_CAP NCC ON NCC.MaNCC = PN.MaNCC
    LEFT JOIN SAN_PHAM_NGON_NGU SN ON SN.MaSP = S.MaSP AND SN.MaNgonNgu = @language
    LEFT JOIN SAN_PHAM_NGON_NGU SV ON SV.MaSP = S.MaSP AND SV.MaNgonNgu = 'VI'
    ORDER BY date DESC;
  `);
  return { products, movements: movements.recordset };
}

async function recordStockMovement(input) {
  const type = input?.type === "Xuất kho" ? "Xuất kho" : input?.type === "Nhập kho" ? "Nhập kho" : "";
  const productId = typeof input?.productId === "string" ? input.productId : "";
  const quantity = Number(input?.quantity);
  if (!type || !productId || !Number.isInteger(quantity) || quantity <= 0) throw new Error("Thông tin phiếu kho không hợp lệ.");
  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const stockResult = await transaction.request().input("id", sql.Char(8), productId).query(`
      SELECT MaKho, SoLuongTon FROM TON_KHO WITH (UPDLOCK, HOLDLOCK) WHERE MaSP = @id ORDER BY MaKho;
    `);
    const rows = stockResult.recordset;
    const current = rows.reduce((sum, row) => sum + row.SoLuongTon, 0);
    if (current === 0 && !rows.length && type === "Xuất kho") throw new Error("Sản phẩm chưa có tồn kho.");
    if (type === "Xuất kho" && quantity > current) throw new Error(`Không đủ tồn kho; hiện chỉ còn ${current} sản phẩm.`);
    let remaining = quantity;
    for (const row of rows) {
      const delta = type === "Nhập kho" && row === rows[0] ? -quantity : type === "Xuất kho" ? Math.min(row.SoLuongTon, remaining) : 0;
      const next = type === "Nhập kho" ? row.SoLuongTon - delta : row.SoLuongTon - delta;
      if (type === "Xuất kho") remaining -= delta;
      await transaction.request().input("id", sql.Char(8), productId).input("warehouse", sql.Char(6), row.MaKho)
        .input("stock", sql.Int, next).query("UPDATE TON_KHO SET SoLuongTon = @stock WHERE MaSP = @id AND MaKho = @warehouse");
    }
    if (!rows.length && type === "Nhập kho") {
      const warehouse = await transaction.request().query("SELECT TOP 1 MaKho AS id FROM KHO ORDER BY MaKho");
      if (!warehouse.recordset[0]) throw new Error("Chưa có kho trong bảng KHO.");
      await transaction.request().input("id", sql.Char(8), productId).input("warehouse", sql.Char(6), warehouse.recordset[0].id)
        .input("quantity", sql.Int, quantity).query("INSERT INTO TON_KHO (MaKho, MaSP, SoLuongTon, MucTonToiThieu) VALUES (@warehouse, @id, @quantity, 5)");
    } else if (type === "Nhập kho" && rows.length === 0) {
      throw new Error("Chưa có kho trong bảng KHO.");
    }
    const code = createMovementId();
    await transaction.request().input("code", sql.NVarChar(32), code).input("type", sql.NVarChar(20), type)
      .input("id", sql.Char(8), productId).input("quantity", sql.Int, quantity)
      .input("partner", sql.NVarChar(200), String(input.partner || "").slice(0, 200))
      .input("note", sql.NVarChar(500), String(input.note || "").slice(0, 500)).query(`
        INSERT INTO LICH_SU_KHO (MaPhieu, LoaiPhieu, MaSP, SoLuong, DoiTac, GhiChu)
        VALUES (@code, @type, @id, @quantity, @partner, @note);
      `);
    await transaction.commit();
    return code;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

function createMovementId() {
  return `MV${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
}

async function createStockProduct(input) {
  const product = await saveProduct({ ...input, stock: 0 });
  try {
    await recordStockMovement({
      type: "Nhập kho",
      productId: product.id,
      quantity: input.quantity,
      partner: input.partner,
      note: input.note,
    });
    return (await getProducts("VI", true)).find((item) => item.id === product.id);
  } catch (error) {
    await removeProduct(product.id);
    throw error;
  }
}

function send(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, GET, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > maxBodyBytes) throw new Error("BODY_TOO_LARGE");
  }
  return JSON.parse(raw || "{}");
}

function publicError(status, code) {
  if (status === 401 || status === 403)
    return "Gemini API từ chối khóa hoặc quyền truy cập. Hãy kiểm tra khóa và bật Gemini API trong Google AI Studio.";
  if (status === 404)
    return "Model Gemini không tồn tại hoặc không được hỗ trợ. Hãy dùng gemini-flash-latest.";
  if (status === 429)
    return "Gemini đang giới hạn yêu cầu hoặc đã hết quota. Vui lòng chờ rồi thử lại.";
  return `Gemini chưa xử lý được yêu cầu (${code || status}).`;
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  const url = new URL(
    req.url || "/",
    `http://${req.headers.host || "localhost"}`,
  );
  const path = url.pathname;
  if (req.method === "GET" && path === "/health") {
    const databaseConnected = await Promise.resolve().then(getDbPool).then(() => true).catch(() => false);
    if (!apiKey)
      return send(res, 200, { ok: true, provider: "gemini", model, aiConnected: false, databaseConnected });

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`,
        {
          headers: { "x-goog-api-key": apiKey },
          signal: AbortSignal.timeout(5000),
        },
      );
      return send(res, 200, {
        ok: true,
        provider: "gemini",
        model,
        aiConnected: response.ok,
        databaseConnected,
      });
    } catch {
      return send(res, 200, { ok: true, provider: "gemini", model, aiConnected: false, databaseConnected });
    }
  }
  if (path === "/api/catalog/products" && req.method === "GET") {
    try {
      return send(res, 200, { products: await getProducts(getLanguage(url)) });
    } catch (error) {
      console.error("SQL Server product query failed:", error.message);
      return send(res, 503, { error: error.message.includes("Thiếu cấu hình") ? error.message : "Không kết nối được SQL Server. Hãy kiểm tra cấu hình DB và trạng thái máy chủ." });
    }
  }
  if (path === "/api/catalog/categories" && req.method === "GET") {
    try {
      return send(res, 200, { categories: await getCategories(getLanguage(url)) });
    } catch (error) {
      console.error("SQL Server catalog category query failed:", error.message);
      return send(res, 503, { error: "Không tải được danh mục từ SQL Server." });
    }
  }
  if (path === "/api/admin/products" && req.method === "GET") {
    try {
      return send(res, 200, { products: await getProducts(getLanguage(url), true) });
    } catch (error) {
      console.error("SQL Server admin product query failed:", error.message);
      return send(res, 503, { error: "Không tải được sản phẩm từ SQL Server." });
    }
  }
  if (path === "/api/admin/products" && req.method === "POST") {
    try {
      return send(res, 201, { product: await saveProduct(await readJson(req)) });
    } catch (error) {
      return send(res, error.message.includes("hợp lệ") ? 400 : 503, { error: error.message || "Không thể lưu sản phẩm." });
    }
  }
  const adminProductMatch = /^\/api\/admin\/products\/([^/]+)$/.exec(path);
  if (adminProductMatch && req.method === "PUT") {
    try {
      return send(res, 200, { product: await saveProduct(await readJson(req), decodeURIComponent(adminProductMatch[1])) });
    } catch (error) {
      const missing = error.message === "Không tìm thấy sản phẩm.";
      return send(res, missing ? 404 : error.message.includes("hợp lệ") ? 400 : 503, { error: error.message || "Không thể cập nhật sản phẩm." });
    }
  }
  if (adminProductMatch && req.method === "DELETE") {
    try {
      if (!await removeProduct(decodeURIComponent(adminProductMatch[1]))) return send(res, 404, { error: "Không tìm thấy sản phẩm." });
      return send(res, 200, { ok: true });
    } catch (error) {
      console.error("SQL Server product delete failed:", error.message);
      return send(res, 503, { error: "Không thể xóa sản phẩm khỏi SQL Server." });
    }
  }
  if (path === "/api/admin/categories" && req.method === "GET") {
    try {
      return send(res, 200, { categories: await getCategories(getLanguage(url)) });
    } catch (error) {
      console.error("SQL Server category query failed:", error.message);
      return send(res, 503, { error: "Không tải được danh mục từ SQL Server." });
    }
  }
  if (path === "/api/admin/categories" && req.method === "POST") {
    try {
      const category = await readJson(req);
      const id = await saveCategory(category);
      return send(res, 201, { category: { ...category, id } });
    } catch (error) {
      return send(res, error.message.includes("không hợp lệ") ? 400 : 503, { error: error.message || "Không thể lưu danh mục." });
    }
  }
  const categoryMatch = /^\/api\/admin\/categories\/([^/]+)$/.exec(path);
  if (categoryMatch && req.method === "PUT") {
    try {
      const category = await readJson(req);
      const id = decodeURIComponent(categoryMatch[1]);
      await saveCategory(category, id);
      return send(res, 200, { category: { ...category, id } });
    } catch (error) {
      return send(res, error.message.includes("không hợp lệ") ? 400 : 503, { error: error.message || "Không thể cập nhật danh mục." });
    }
  }
  if (categoryMatch && req.method === "DELETE") {
    try {
      if (!await removeCategory(decodeURIComponent(categoryMatch[1]))) return send(res, 404, { error: "Không tìm thấy danh mục." });
      return send(res, 200, { ok: true });
    } catch (error) {
      console.error("SQL Server category delete failed:", error.message);
      return send(res, 503, { error: "Không thể xóa danh mục khỏi SQL Server." });
    }
  }
  if (path === "/api/admin/stock" && req.method === "GET") {
    try {
      return send(res, 200, await getStockData(getLanguage(url)));
    } catch (error) {
      console.error("SQL Server stock query failed:", error.message);
      return send(res, 503, { error: "Không tải được tồn kho và lịch sử từ SQL Server. Hãy kiểm tra migration kho." });
    }
  }
  if (path === "/api/admin/stock/movements" && req.method === "POST") {
    try {
      const movement = await readJson(req);
      const id = await recordStockMovement(movement);
      return send(res, 201, { id });
    } catch (error) {
      const invalid = error.message.includes("không hợp lệ") || error.message.startsWith("Không đủ tồn kho") || error.message.includes("Sản phẩm chưa có");
      return send(res, invalid ? 400 : 503, { error: error.message || "Không thể ghi phiếu kho." });
    }
  }
  if (path === "/api/admin/stock/products" && req.method === "POST") {
    try {
      const product = await createStockProduct(await readJson(req));
      return send(res, 201, { product });
    } catch (error) {
      console.error("SQL Server stock product creation failed:", error.message);
      return send(res, 400, { error: error.message || "Không thể tạo sản phẩm và phiếu nhập." });
    }
  }
  if (req.method !== "POST" || path !== "/api/chat")
    return send(res, 404, { error: "Không tìm thấy endpoint." });
  if (!apiKey)
    return send(res, 503, {
      error: "Backend chưa được cấu hình GEMINI_API_KEY trong .env.",
    });

  const client = req.socket.remoteAddress || "unknown";
  const now = Date.now();

  // Đã sửa lỗi ngắt dòng ở điều kiện lọc thời gian
  const timestamps = (recentRequests.get(client) || []).filter(
    (time) => now - time < 60_000,
  );
  if (timestamps.length >= 20)
    return send(res, 429, {
      error: "Bạn gửi yêu cầu quá nhanh. Hãy thử lại sau một phút.",
    });
  timestamps.push(now);
  recentRequests.set(client, timestamps);

  try {
    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (Buffer.byteLength(raw) > maxBodyBytes)
        return send(res, 413, { error: "Nội dung chat quá dài." });
    }
    const body = JSON.parse(raw || "{}");
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length)
      return send(res, 400, { error: "Hãy nhập câu hỏi trước." });

    const contents = messages
      .slice(-16)
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: String(message.content || "").slice(0, 6000) }],
      }))
      .filter((message) => message.parts[0].text.trim());

    if (contents.at(-1)?.role !== "user")
      return send(res, 400, {
        error: "Tin nhắn cuối phải là câu hỏi của bạn.",
      });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: "Bạn là trợ lý tư vấn sản phẩm của cửa hàng SmartShop. Trả lời bằng tiếng Việt, rõ ràng và trung thực. Với thông tin sản phẩm cần cập nhật, hãy dùng Google Search grounding. Phân biệt giá tham khảo với giá cửa hàng; không tự bịa giá hoặc tồn kho.",
              },
            ],
          },
          tools: [{ google_search: {} }],
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
        }),
        signal: AbortSignal.timeout(45_000),
      },
    );

    const result = await response.json();
    if (!response.ok) {
      const code =
        result?.error?.status || result?.error?.code || response.status;
      console.error("Gemini request failed", { status: response.status, code });
      return send(res, 502, { error: publicError(response.status, code) });
    }

    const candidate = result.candidates?.[0];
    const answer = candidate?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n")
      .trim();
    if (!answer)
      return send(res, 502, {
        error: "Gemini không trả về nội dung. Hãy thử hỏi lại.",
      });

    const sources = (candidate.groundingMetadata?.groundingChunks || [])
      .map((chunk) => chunk.web)
      .filter((web) => web?.uri)
      .map(({ title, uri }) => ({ title: title || uri, url: uri }))
      .filter(
        (source, index, all) =>
          all.findIndex((item) => item.url === source.url) === index,
      );

    return send(res, 200, { answer, sources });
  } catch (error) {
    const causeCode = error?.cause?.code;
    console.error("Chat request failed", {
      name: error?.name || "UnknownError",
      code: typeof causeCode === "string" ? causeCode : undefined,
    });
    return send(res, 500, {
      error:
        error?.name === "TimeoutError"
          ? "Gemini phản hồi quá lâu. Hãy thử lại."
          : error?.name === "TypeError"
            ? `Backend không kết nối được tới Google Gemini${typeof causeCode === "string" ? ` (${causeCode})` : ""}. Hãy kiểm tra quyền truy cập internet của máy chạy backend.`
            : "Backend gặp lỗi khi gọi Gemini. Hãy xem log backend để biết chi tiết.",
    });
  }
});

server.listen(port, "0.0.0.0", () =>
  console.log(
    `SmartShop backend listening on port ${port} (database ${process.env.DB_NAME?.trim() || "ElectronicCommerceDB"})`,
  ),
);
