# API Contracts

## Overview

This document describes the API contracts for the Green Fashion Score platform Edge Functions.

## Authentication

All API endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

## POST /functions/v1/scoring

Submit a survey response and calculate the sustainability score.

### Request

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json`

**Body:**
```json
{
  "scope": "general" | "product",
  "product_type": "jersey" | "pantalon" | "polo" | "vestido" | "bolso" | "calzado" | "camisa" | "camiseta" | "falda",
  "answers": [
    {
      "questionId": "uuid",
      "answerId": "uuid", 
      "numericValue": 5.0
    }
  ]
}
```

**Field Descriptions:**
- `scope`: Required. Either "general" for company-wide survey or "product" for product-specific survey
- `product_type`: Required if `scope` is "product". One of the supported product types
- `answers`: Required array of survey responses
  - `questionId`: UUID of the question being answered
  - `answerId`: UUID of the selected answer
  - `numericValue`: Numeric score value for the answer

### Response 200

```json
{
  "surveyId": "uuid",
  "score": {
    "people": 15.5,
    "planet": 18.0,
    "materials": 32.0,
    "circularity": 16.0,
    "total": 81.5,
    "grade": "A"
  }
}
```

**Field Descriptions:**
- `surveyId`: UUID of the created survey record
- `score`: Calculated sustainability score
  - `people`: Score for People dimension (0-20)
  - `planet`: Score for Planet dimension (0-20)
  - `materials`: Score for Materials dimension (0-40)
  - `circularity`: Score for Circularity dimension (0-20)
  - `total`: Total score (0-100)
  - `grade`: Letter grade (A, B, C, D, E)

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Too Many Requests"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error"
}
```

## GET /functions/v1/dashboard

Retrieve aggregated sustainability scores for a user.

### Request

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`
- `If-None-Match: "etag"` (optional, for caching)

### Response 200

```json
{
  "people": 20.0,
  "planet": 20.0,
  "materials": 40.0,
  "circularity": 20.0,
  "total": 100.0,
  "grade": "A",
  "breakdown": [
    {
      "surveyId": "uuid",
      "scope": "general",
      "scores": {
        "people": 15.0,
        "planet": 18.0,
        "materials": 30.0,
        "circularity": 15.0,
        "total": 78.0,
        "grade": "A"
      },
      "total": 78.0,
      "grade": "A"
    },
    {
      "surveyId": "uuid",
      "scope": "product",
      "productType": "jersey",
      "scores": {
        "people": 5.0,
        "planet": 2.0,
        "materials": 10.0,
        "circularity": 5.0,
        "total": 22.0,
        "grade": "C"
      },
      "total": 22.0,
      "grade": "C"
    }
  ]
}
```

**Headers:**
- `ETag: "hash"`

**Field Descriptions:**
- `people`, `planet`, `materials`, `circularity`: Aggregated scores across all surveys
- `total`: Total aggregated score (0-100)
- `grade`: Overall letter grade
- `breakdown`: Array of individual survey scores
  - `surveyId`: UUID of the survey
  - `scope`: "general" or "product"
  - `productType`: Product type (only for product surveys)
  - `scores`: Individual survey scores
  - `total`: Individual survey total
  - `grade`: Individual survey grade

### Response 304

**Not Modified** (if `If-None-Match` matches `ETag`)

### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error"
}
```

## Rate Limiting

- **Scoring endpoint**: 10 requests per minute per IP
- **Dashboard endpoint**: No rate limiting (cached responses)

## Caching

- **Dashboard endpoint**: Uses ETag for client-side caching
- **Scoring endpoint**: No caching (creates new data)

## Error Handling

All endpoints return JSON error responses with appropriate HTTP status codes:

- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid JWT)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error (server-side error)

## Data Validation

### Scoring Endpoint
- `scope` must be "general" or "product"
- `product_type` required if `scope` is "product"
- `answers` must be non-empty array
- Each answer must have valid `questionId`, `answerId`, and `numericValue`

### Dashboard Endpoint
- No input validation (uses JWT for user identification)

## Security

- All endpoints require valid JWT authentication
- User can only access their own data (enforced by RLS)
- Service role key used only in Edge Functions (never exposed to client)
- Rate limiting prevents abuse

## Examples

### Submit General Survey
```bash
curl -X POST https://your-project.supabase.co/functions/v1/scoring \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "general",
    "answers": [
      {
        "questionId": "q1-uuid",
        "answerId": "a1-uuid",
        "numericValue": 5.0
      }
    ]
  }'
```

### Submit Product Survey
```bash
curl -X POST https://your-project.supabase.co/functions/v1/scoring \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "product",
    "product_type": "jersey",
    "answers": [
      {
        "questionId": "pq1-uuid",
        "answerId": "pa1-uuid",
        "numericValue": 3.0
      }
    ]
  }'
```

### Get Dashboard
```bash
curl -X GET https://your-project.supabase.co/functions/v1/dashboard \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Get Dashboard with Caching
```bash
curl -X GET https://your-project.supabase.co/functions/v1/dashboard \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "If-None-Match: \"12345\""
```

