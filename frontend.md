**Question**

Explain how you would optimize for performance of a Vue.js based application that renders a large liste of items (e.g: 10,000 rows in a table). What techniques/Vue.js features would you use to ensure smooth scrolling and responsiveness? Please be as detailed as possible.

**Answer**
I would do the following:
- 

---

**Project**

Build a OAuth 2.0 + PKCE consent screen with Vue.js that allows external applications to connect with an Orqestra account.


- Show Application name & description
- Show scopes/permissions being requested
- Authorize button that redirects to `redirect_url` + code & state
- Error handling

Once completed, provide a github repo with instructions on how to build and deploy/run the project.

---
**URL Query Example:**
`https://myurl.com/oauth/authorize?client_id=8f9a0002-ae0f-4412-ac4c-902f1e88e5ff&state=-G2EoDooYcrJ5p8EF1AM677T8BvnSMxQMU4HtUjoQ4Y&redirect_uri=https%3A%2F%2Fzapier.com%2Fdashboard%2Fauth%2Foauth%2Freturn%2FApp222291CLIAPI%2F&response_type=code&scope=conversion&code_challenge=BSupaW6JDyiPDgU4HM8wkLj94DELW0BvsxPAoO2d5XA&code_challenge_method=S256`


**Test Parameters:**

_client_id_ = `8f9a0002-ae0f-4412-ac4c-902f1e88e5ff`

_scope_ = `conversion`

_state_ = `-G2EoDooYcrJ5p8EF1AM677T8BvnSMxQMU4HtUjoQ4Y`

_redirect_uri_ = `https://zapier.com/dashboard/auth/oauth/return/App222291CLIAPI/`

_response_type_ = `code`

_code_challenge_ = `BSupaW6JDyiPDgU4HM8wkLj94DELW0BvsxPAoO2d5XA`

_code_challenge_method_ = `S256`


---

**API Endpoints:**

The endpoints below are authorized endpoints, please attach an `Authorization` header with the following value/JWT:

`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5ldGZvcnVtK29saXZAZ21haWwuY29tIiwiaWQiOjc1LCJwcm92aWRlciI6Im5vbmUifQ.hBu6-PxvoyoHUorzCs6xkP2A1ZgmcZ8QzRTKepq0iIY`

(GET) _Returns description of oauth client (name, description, logo, scopes)_

`curl --location 'https://dev-api.orqestra.io/oauth/scopes?client_id=8f9a0002-ae0f-4412-ac4c-902f1e88e5ff&scope=conversion' \
--header 'Authorization: ••••••'`

(POST) _Returns a code given a client_id, redirect_uri, response_type, scope, code_challenge, code_challenged_method_

`curl --location --request POST 'https://dev-api.orqestra.io/oauth/authorize?client_id=&redirect_uri=&response_type=&scope=&code_challenge=&code_challenge_method=' \
--header 'Authorization: ••••••'`
