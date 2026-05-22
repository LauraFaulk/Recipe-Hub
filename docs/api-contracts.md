# API Contracts (MVP)

## POST `/api/upload`
Uploads a media file and returns a media record.

### Request
- `multipart/form-data`
  - `file`: supported types: `image/png`, `image/jpeg`, `image/webp`, `video/mp4`, `text/plain`
  - max size: `10MB`

### Response
```json
{
  "mediaId": "med_123",
  "sourceType": "image",
  "storageUrl": "memory://med_123/photo.png",
  "status": "uploaded"
}
```

Notes:
- In local MVP mode, `storageUrl` currently uses `memory://...`.
- The response schema also allows `http://...` or `https://...` for future external storage backends.

## POST `/api/ingest`
Triggers extraction and structured parsing for a previously uploaded file.

### Request
```json
{
  "mediaId": "med_123"
}
```

### Response
```json
{
  "recipeId": "rcp_123",
  "confidence": 0.87,
  "warnings": ["Could not determine exact amount for 'salt'"],
  "missingFields": ["ingredients.0.amount"],
  "status": "ready_for_review"
}
```

Possible statuses:
- `ready_for_review`: parse succeeded with no warnings.
- `failed`: parse finished with warnings and/or missing required fields.

## GET `/api/recipes/:id`
Returns structured recipe payload.

### Response (200)
```json
{
  "recipe": { "id": "rcp_123", "title": "..." }
}
```

### Response (404)
```json
{
  "code": "not_found",
  "message": "recipe not found"
}
```

## PATCH `/api/recipes/:id`
Updates recipe after user edits.

### Request
`Recipe` object from `src/types/recipe.ts`.

### Response (200)
Updated `Recipe` object.

### Response (400)
`bad_request` when path id and body recipe id do not match or payload is invalid.

### Response (404)
`not_found` when recipe does not exist.


## GET `/api/recipes/:id/export`
Exports a recipe as a downloadable HTML file.

### Response
- `200 text/html` attachment (`<recipe-id>.html`)
- `404` if recipe does not exist

## GET `/api/telemetry/ingest`
Returns ingestion telemetry summary and recent events.

### Response
```json
{
  "summary": {
    "total": 10,
    "failed": 2,
    "ready": 8,
    "avgConfidence": 0.74
  },
  "events": [
    {
      "mediaId": "med_123",
      "recipeId": "rcp_123",
      "status": "ready_for_review",
      "warningCount": 0,
      "missingFieldCount": 0,
      "confidence": 0.9,
      "createdAt": "2026-05-20T10:00:00.000Z"
    }
  ]
}
```


## Error responses
Common API error shape:

```json
{
  "code": "bad_request",
  "message": "human readable message"
}
```

Typical status/code pairs in this MVP:
- `400 bad_request` (invalid payload or missing required fields)
- `404 not_found` (missing media/recipe)
- `413 payload_too_large` (upload exceeds 10MB)
- `415 unsupported_media_type` (upload MIME type not allowed)

## Known MVP constraints
- Upload storage URLs are local-first (`memory://...`) in this implementation.
- Recipe export is HTML attachment only in MVP (PNG/PDF is not yet part of this contract).
- Telemetry API returns only recent events (current route requests `listIngestEvents(25)`).
