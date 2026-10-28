# On-demand brand description translation

The localization service calls the selected unofficial Google Translate endpoint from server-side `HttpClient`. The browser requests a translation from this service; translated descriptions are returned to the page and are not written to the database. The original `brand.description` and `description_language_code` remain unchanged, and no translation-table migration is needed.

The endpoint is experimental and may be rate-limited or changed upstream; it has no unlimited-free or uptime guarantee.

## Configuration

The service uses the same server-only settings as the other database services:

- `ConnectionStrings__Supabase`
- `Gateway__SharedKey`

It listens on port `5102` locally. The gateway routes `/api/localization/*` to this service.

## Endpoints

- `POST /api/localization/brands/{brandId}/translations/{languageCode}` reads the source description, checks that the target language is enabled, translates it and returns the result without saving it. The gateway limits this route to 10 requests per IP per minute.
- `POST /api/admin/localization/brands/{brandId}/translations/{languageCode}` provides the same non-persistent translation through the admin route.
- `GET /api/localization/brands/{brandId}` returns the original source description.

The database language codes `en`, `ja`, `vi`, and `zh` are supported when enabled. The `zh` code is sent upstream as `zh-CN`.

The language selector changes the navigation, home page and map labels through local dictionaries. On brand detail pages it also translates the brand description on demand. Results are cached only in that page instance so switching back to a language does not request another translation. Leaving the detail page or reloading clears that cache. Other fixed copy elsewhere in the site may still be Vietnamese.
