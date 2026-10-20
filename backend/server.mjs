import { createServer } from "node:http";

const port = Number(process.env.PORT || 3333);
const apiKey = process.env.GEMINI_API_KEY?.trim();
const model = process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest";
const maxBodyBytes = 64 * 1024; // Đã sửa lỗi ngắt dòng
const recentRequests = new Map();

function send(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, GET, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(payload));
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
  const path = new URL(
    req.url || "/",
    `http://${req.headers.host || "localhost"}`,
  ).pathname;
  if (req.method === "GET" && path === "/health")
    return send(res, 200, { ok: true, provider: "gemini", model });
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
    console.error("Chat request failed", error?.name || "UnknownError");
    return send(res, 500, {
      error:
        error?.name === "TimeoutError"
          ? "Gemini phản hồi quá lâu. Hãy thử lại."
          : "Không thể xử lý câu hỏi lúc này. Hãy kiểm tra backend và thử lại.",
    });
  }
});

server.listen(port, "0.0.0.0", () =>
  console.log(
    `SmartShop Gemini proxy listening on port ${port} (model ${model})`,
  ),
);
