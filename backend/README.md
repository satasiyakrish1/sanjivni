# Herbal AI Remedy Generator Backend

This is the backend service for the Herbal AI Remedy Generator, which uses Google's Generative AI to suggest herbal remedies based on user-reported symptoms.

## Features

- AI-powered herbal remedy suggestions
- Input validation for health-related queries
- Clear, structured response format
- Health check endpoint

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   NODE_ENV=development
   ```

## Running the Server

- Development mode (with auto-restart):
  ```bash
  npm run dev
  ```

- Production mode:
  ```bash
  npm start
  ```

## API Endpoints

### Health Check
- `GET /health`
  - Returns the status of the API

### Generate Herbal Remedy
- `POST /api/herbal-remedy`
  - Request body: `{ "symptoms": "your symptoms here" }`
  - Returns: AI-generated herbal remedy suggestions

## Example Request

```http
POST /api/herbal-remedy
Content-Type: application/json

{
  "symptoms": "I have a cough and sore throat"
}
```

## Error Handling

- 400: Invalid or non-health-related input
- 500: Server error while processing the request

## Environment Variables

- `PORT`: Port number for the server (default: 5000)
- `GOOGLE_AI_API_KEY`: Your Google AI API key
- `NODE_ENV`: Environment (development/production)
