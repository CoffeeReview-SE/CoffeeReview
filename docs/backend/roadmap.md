# Backend roadmap

## Product direction

Build SaigonCoffee's backend around the existing ASP.NET Core services and gateway. Use the current admin/service conventions as the implementation reference: server-side configuration for secrets, validated request DTOs, parameterized database access where needed, rate limits for public endpoints, and small independently deployable services where a separate runtime is useful.

Keep the existing React + Vite frontend. The Next.js example in the proposal describes the flow, not a request to migrate the frontend.

## Planned capabilities

1. **Chat assistant — in progress**
   - The gateway already exposes `POST /api/assistant/chat` and `GET /api/assistant/status` for Groq.
   - Keep provider credentials on the server.
   - Next, provide relevant brand and branch data to the assistant so recommendations come from SaigonCoffee's catalog.

2. **Translation**
   - Prototype with the user's selected unofficial Google Translate wrapper endpoint through backend `HttpClient`; do not call it directly from the browser.
   - Translate the stored source description on demand and return it without writing translation data to the database.
   - Cache translations in page memory for the current session; reloading starts with an empty translation cache.
   - The shared language selector triggers on-demand translation on brand detail pages; static UI strings remain a separate localization task.
   - Treat the wrapper as an experimental dependency without a free-use or uptime guarantee. Keep the translation provider behind a service interface so it can be replaced by an official API later.

3. **Text to speech**
   - Keep browser speech as the fallback.
   - If neural MP3 output is needed, add a small Python `edge-tts` service behind the ASP.NET Core API and return audio to the React client. Treat the upstream Edge speech endpoint as an external dependency that may change.

4. **Deployment**
   - Extend the existing Docker Compose setup only when the Python TTS service is added.
   - Store provider keys as private server environment variables; never expose them through Vite `VITE_` variables.

## Scope notes

- Do not migrate to Next.js or replace the existing gateway as part of these backend features.
- Keep admin dashboard work separate from assistant/translation/TTS changes unless explicitly requested.
- Free-tier quotas and provider availability can change; do not promise unlimited free operation.
