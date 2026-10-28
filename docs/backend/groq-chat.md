# Groq chat endpoint

The gateway exposes `POST /api/assistant/chat`, loads matching active brands and branches from Supabase, and sends that reference data with validated chat history to Groq. The API key stays in the gateway process and must not use a `VITE_` prefix. The assistant is instructed to avoid inventing business details when the database has no matching information.

`GET /api/assistant/status` checks that the key can reach Groq, that the configured model is available, and that the Gateway can query Supabase. It returns `connected`, `groqConnected`, and `supabaseConnected`. The floating chat button uses `connected` for its green (connected) or red (unavailable) indicator.

## Local setup

From the gateway project directory, store the key with .NET User Secrets:

```powershell
dotnet user-secrets set "Chat:GroqApiKey" "YOUR_GROQ_API_KEY"
```

For deployment, set `Chat__GroqApiKey` as a private environment variable. `Chat__GroqModel` is optional; the default is `openai/gpt-oss-120b`.

For the local full stack, put `Chat__GroqApiKey` and `ConnectionStrings__Supabase` in the repository-root `.env` file (copy `.env.example` first). The dev-stack passes both values to Gateway; `.env.example` is only a template and is not loaded. Gateway needs the same Supabase connection string as Catalog because chat context is read by Gateway directly.

## Request

```http
POST /api/assistant/chat
Content-Type: application/json
```

```json
{
  "messages": [
    { "role": "user", "content": "Gợi ý quán cà phê ở Quận 1" }
  ]
}
```

The endpoint accepts 1–12 user/assistant messages, at most 2,000 characters per message and 10,000 characters total. The latest message must be from the user. It is limited to 10 requests per IP per minute. A successful response is `{ "answer": "...", "model": "..." }`.

Database context is read-only and limited to up to 12 active brand/branch rows matching words in the latest user message. It uses parameterized SQL and does not send database credentials to Groq.
