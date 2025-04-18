# Orqestra OAuth 2.0 Consent Screen

A Vue.js application that implements an OAuth 2.0 + PKCE consent screen for Orqestra. This application allows external applications to connect with an Orqestra account by displaying application details, requested permissions, and handling the OAuth authorization flow.

## Features

- Display application name, description, and logo
- Show requested permissions/scopes
- Handle OAuth 2.0 + PKCE authorization flow
- Error handling and loading states
- Modern, responsive UI

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd orqestra-oauth-consent
```

2. Install dependencies:
```bash
npm install
```

## Development

To run the development server:

```bash
npm run serve
```

This will start the development server at `http://localhost:8080`.

## Building for Production

To create a production build:

```bash
npm run buildre
```

The built files will be in the `dist` directory.

## Testing the OAuth Flow

To test the OAuth consent screen, you can use the following example URL with the test parameters:

```
http://localhost:3000/authorize?client_id=8f9a0002-ae0f-4412-ac4c-902f1e88e5ff&state=-G2EoDooYcrJ5p8EF1AM677T8BvnSMxQMU4HtUjoQ4Y&redirect_uri=https%3A%2F%2Fzapier.com%2Fdashboard%2Fauth%2Foauth%2Freturn%2FApp222291CLIAPI%2F&response_type=code&scope=conversion&code_challenge=BSupaW6JDyiPDgU4HM8wkLj94DELW0BvsxPAoO2d5XA&code_challenge_method=S256
```

## API Integration

The application integrates with two Orqestra API endpoints:

1. GET `/oauth/scopes` - Retrieves application details and scope information
2. POST `/oauth/authorize` - Handles the authorization request

Note: The API endpoints require authentication via JWT token in the Authorization header.

## Error Handling

The application handles various error scenarios:

- Missing or invalid URL parameters
- Failed API requests
- Authorization failures
- Network errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
