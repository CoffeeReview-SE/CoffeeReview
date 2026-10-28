# Groq chat endpoint

The gateway exposes `POST /api/assistant/chat` and forwards validated chat history to Groq. The API key stays in the gateway process and must not use a `VITE_` prefix.

`GET /api/assistant/status` checks that the key can reach Groq and that the configured model is available. The floating chat button uses this endpoint for its green (connected) or red (unavailable) indicator.

## Local setup

From the gateway project directory, store the key with .NET User Secrets:

```powershell
dotnet user-secrets set "Chat:GroqApiKey" "YOUR_GROQ_API_KEY"
```

For deployment, set `Chat__GroqApiKey` as a private environment variable. `Chat__GroqModel` is optional; the default is `openai/gpt-oss-120b`.

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

The assistant currently answers from the conversation only; it is not connected to the brand or branch database yet.
