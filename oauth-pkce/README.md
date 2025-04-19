# Orqestra OAuth 2.0 Consent Screen

A simple OAuth 2.0 consent screen for Orqestra built with Vue.js. This app allows external applications to connect to Orqestra by displaying app details and handling the authorization flow.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run serve
```

3. Build for production:
```bash
npm run build
```

## Testing

Use this URL to test the consent screen locally:

```
http://localhost:3000/authorize?client_id=8f9a0002-ae0f-4412-ac4c-902f1e88e5ff&state=-G2EoDooYcrJ5p8EF1AM677T8BvnSMxQMU4HtUjoQ4Y&redirect_uri=https%3A%2F%2Fzapier.com%2Fdashboard%2Fauth%2Foauth%2Freturn%2FApp222291CLIAPI%2F&response_type=code&scope=conversion&code_challenge=BSupaW6JDyiPDgU4HM8wkLj94DELW0BvsxPAoO2d5XA&code_challenge_method=S256
```

## API Endpoints Used

- GET `/oauth/scopes` - Get app details and scope info
- POST `/oauth/authorize` - Handle authorization request
