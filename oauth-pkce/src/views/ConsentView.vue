<template>
  <div class="consent-screen">
    <div v-if="error" class="error-container">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <div class="error-details">
        <p>Missing or invalid parameters:</p>
        <ul>
          <li v-for="param in missingParams" :key="param">{{ param }}</li>
        </ul>
        <button @click="goBack" class="cancel-btn">Go back</button>
      </div>
    </div>
    
    <div v-else-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Loading application details...</p>
    </div>
    
    <div v-else class="consent-container">
      <div class="app-info">
        <div class="logo-container">
          <img src="../assets/logo-only.png" width="24" height="24" alt="Orqestra logo mark" class="logo-mark">
          <img src="../assets/logo-word.png" width="100" height="24" alt="Orqestra wordmark" class="logo-word">
        </div>
      </div>

      <!-- diviindg line -->
      <div class="divider"></div>

      <div class="consent-content">
        <img v-if="clientInfo.logo_uri" :src="clientInfo.logo_uri" :alt="clientInfo.name + ' logo'" class="external-app-logo">
        <h1 class="consent-title"><b>{{ clientInfo.name || 'An application' }}</b> wants to access your Orqestra account.</h1>
        
        <div class="app-details">
          <p class="app-description">{{ clientInfo.display_description }}</p>
        </div>

        <div class="permissions">
          <span v-if="clientInfo?.scope_description?.length > 0">
          <h2>This will allow {{ clientInfo.name || 'the application' }} to:</h2>
          <ul class="scope-list">
              <li v-for="scope in clientInfo.scope_description" :key="scope.name" class="scope-item">
                <div class="scope-icon">✓</div>
                <div class="scope-content">
                  <p>{{ scope }}</p>
                </div>
              </li>
            </ul>
          </span>
          <span v-else class="no-permissions">
            <p>No permissions requested.</p>
          </span>
        </div>

        <p class="consent-notice">By clicking "Continue", you will be allowing this application to access your Orqestra account.</p>
        <p class="privacy-notice">For more information, please review our <a href="#" class="privacy-link">Privacy Policy</a> and <a href="#" class="privacy-link">Terms of Service</a>.</p>

        <div class="actions">
          <button @click="goBack" class="cancel-btn">Go back</button>
          <button @click="handleAuthorize" class="authorize-btn" :disabled="loading">
            Continue
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsentView',
  data() {
    return {
      loading: true,
      error: null,
      clientInfo: {
        client_id: '',
        name: '',
        display_description: '',
        logo_uri: '',
        scope_description: [],
        previously_consented: false
      },
      queryParams: {
        client_id: '',
        state: '',
        redirect_uri: '',
        response_type: '',
        scope: '',
        code_challenge: '',
        code_challenge_method: ''
      }
    }
  },
  created() {
    this.initializeQueryParams()
    if (!this.error) {
      this.fetchClientInfo()
    }
  },
  methods: {
    validateParams(params) {
      const requiredParams = [
        'client_id',
        'redirect_uri',
        'response_type',
        'scope',
        'code_challenge',
        'code_challenge_method'
      ]

      // Check for missing or empty required parameters
      const missingParams = requiredParams.filter(param => !params[param]?.trim())
      
      if (missingParams.length > 0) {
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`)
      }

      // Validate response_type
      if (params.response_type !== 'code') {
        throw new Error('Invalid response_type: expected "code"')
      }

      // Validate code_challenge_method
      if (params.code_challenge_method !== 'S256') {
        throw new Error('Invalid code_challenge_method: expected "S256"')
      }

      // Validate redirect_uri format
      try {
        new URL(params.redirect_uri)
      } catch {
        throw new Error('Invalid redirect_uri format')
      }

      return true
    },
    initializeQueryParams() {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        
        // Log raw URL parameters for debugging
        console.log('Raw URL parameters:', Object.fromEntries(urlParams.entries()))
        
        const params = {
          client_id: urlParams.get('client_id')?.trim(),
          state: urlParams.get('state')?.trim(),
          redirect_uri: decodeURIComponent(urlParams.get('redirect_uri') || '').trim(),
          response_type: urlParams.get('response_type')?.trim(),
          scope: urlParams.get('scope')?.trim(),
          code_challenge: urlParams.get('code_challenge')?.trim(),
          code_challenge_method: urlParams.get('code_challenge_method')?.trim()
        }

        // Validate parameters
        this.validateParams(params)
        
        // If validation passes, set the parameters
        this.queryParams = params

        // Log processed parameters for debugging
        console.log('Processed parameters:', this.queryParams)
      } catch (err) {
        console.error('Error processing parameters:', err)
        this.error = err.message
        this.loading = false
      }
    },
    async fetchClientInfo() {
      try {
        const response = await fetch(
          `https://dev-api.orqestra.io/oauth/scopes?client_id=${this.queryParams.client_id}&scope=${this.queryParams.scope}`,
          {
            headers: {
              'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5ldGZvcnVtK29saXZAZ21haWwuY29tIiwiaWQiOjc1LCJwcm92aWRlciI6Im5vbmUifQ.hBu6-PxvoyoHUorzCs6xkP2A1ZgmcZ8QzRTKepq0iIY'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch application details')
        }
        
        this.clientInfo = await response.json();
        this.clientInfo = this.clientInfo.data;
      } catch (err) {
        console.error('Error fetching client info:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async handleAuthorize() {
      try {
        this.loading = true
        
        const url = new URL('https://dev-api.orqestra.io/oauth/authorize')
        url.searchParams.append('client_id', this.queryParams.client_id)
        url.searchParams.append('redirect_uri', this.queryParams.redirect_uri)
        url.searchParams.append('response_type', this.queryParams.response_type)
        url.searchParams.append('scope', this.queryParams.scope)
        url.searchParams.append('code_challenge', this.queryParams.code_challenge)
        url.searchParams.append('code_challenge_method', this.queryParams.code_challenge_method)

        console.log('Request URL:', url.toString())

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5ldGZvcnVtK29saXZAZ21haWwuY29tIiwiaWQiOjc1LCJwcm92aWRlciI6Im5vbmUifQ.hBu6-PxvoyoHUorzCs6xkP2A1ZgmcZ8QzRTKepq0iIY'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error response:', errorData)
          throw new Error(errorData.message || 'Authorization failed')
        }

        const responseData = await response.json()
        console.log('Success response:', responseData)
        
        const { code } = responseData
        const redirectUrl = new URL(this.queryParams.redirect_uri)
        redirectUrl.searchParams.append('code', code)
        if (this.queryParams.state) {
          redirectUrl.searchParams.append('state', this.queryParams.state)
        }
        
        window.location.href = redirectUrl.toString()
      } catch (err) {
        console.error('Error:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    goBack() {
      window.history.back()
    }
  }
}
</script>

<style scoped>
.consent-screen {
  max-width: 450px;
  margin: 48px auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.error-container {
  color: #d93025;
  text-align: center;
  padding: 24px;
}

.error-details {
  margin-top: 16px;
}

.back-btn {
  background: transparent;
  color: rgb(242, 137, 66);
  border: none;
  padding: 8px 24px;
  border-radius: 4px;
}

.no-permissions {
  margin-top: 16px;
}

.loading-container {
  text-align: center;
  padding: 48px 24px;
}

.loader {
  border: 3px solid #f3f3f3;
  border-radius: 50%;
  border-top: 3px solid rgb(242, 137, 66);
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}


.orqestra-logo {
  height: 24px;
  margin: 24px 0;
}

.divider {
  height: 1px;
  background-color: #dadce0;
  width: 100%;
}

.consent-container {
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.app-info {
  padding: 0 24px;
}

.consent-content {
  padding: 24px;
  flex-grow: 1;
}

.consent-title {
  font-size: 24px;
  font-weight: 400;
  color: #202124;
  margin: 0 0 8px;
  line-height: 1.3;
}

.app-details {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.app-logo, .external-app-logo {
  width: 48px;
  height: 48px;
  margin-right: 16px;
  border-radius: 10px;
  object-fit: contain;
}

.external-app-logo {
  margin: 10px 0;
}

.app-description {
  color: #5f6368;
  margin: 0;
  font-size: 14px;
}

.permissions h2 {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 16px;
}

.scope-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.scope-item {
  display: flex;
  align-items: flex-start;
  padding: 2px 0;
}

.scope-icon {
  color: rgb(242, 137, 66);
  margin-right: 16px;
  font-size: 18px;
}

.scope-content h3 {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  margin: 0 0 4px;
}

.scope-content p {
  font-size: 14px;
  color: #5f6368;
  margin: 0;
  line-height: 1.4;
}

.consent-notice, .privacy-notice {
  font-size: 12px;
  color: #5f6368;
  margin: 32px 0 0 0;
  line-height: 1.4;
}

.privacy-notice {
  margin: 12px 0 0 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #dadce0;
}

.cancel-btn {
  background: transparent;
  color: rgb(242, 137, 66);
  border: none;
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  color: rgb(185, 97, 38);
}

.authorize-btn {
  background: rgb(242, 137, 66);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.authorize-btn:hover {
  background: rgb(185, 97, 38);
}

.authorize-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.divider {
  margin: 24px 0;
  height: 1px;
  background-color: #dadce0;
  width: 100%;
}

</style> 