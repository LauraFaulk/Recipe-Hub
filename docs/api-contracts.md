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
  "storageUrl": "https://...",
  "status": "uploaded"
}
```

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

## GET `/api/recipes/:id`
Returns structured recipe payload.

## PATCH `/api/recipes/:id`
Updates recipe after user edits.

### Request
`Recipe` object from `src/types/recipe.ts`.

### Response
Updated `Recipe` object.
