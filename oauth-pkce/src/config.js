// Obvi this wouldn't be hardcoded in a real app
const params = {
    client_id: '8f9a0002-ae0f-4412-ac4c-902f1e88e5ff',
    scope: 'conversion',
    state: '-G2EoDooYcrJ5p8EF1AM677T8BvnSMxQMU4HtUjoQ4Y',
    redirect_uri: 'https://zapier.com/dashboard/auth/oauth/return/App222291CLIAPI/',
    response_type: 'code',
    code_challenge: 'BSupaW6JDyiPDgU4HM8wkLj94DELW0BvsxPAoO2d5XA',
    code_challenge_method: 'S256'
}

const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5ldGZvcnVtK29saXZAZ21haWwuY29tIiwiaWQiOjc1LCJwcm92aWRlciI6Im5vbmUifQ.hBu6-PxvoyoHUorzCs6xkP2A1ZgmcZ8QzRTKepq0iIY'

const baseUrl = 'https://dev-api.orqestra.io';


export { params, jwt, baseUrl };
