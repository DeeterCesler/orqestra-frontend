import { mount } from '@vue/test-utils'
import ConsentView from '../ConsentView.vue'

// Mock fetch globally
global.fetch = jest.fn()

// Valid parameters for testing
const validParams = {
  client_id: '8f9a0002-ae0f-4412-ac4c-902f1e88e5ff',
  scope: 'conversion',
  state: '-G2EoDooYcrJ5p8EF1AM677T8BvnSMxQMU4HtUjoQ4Y',
  redirect_uri: 'https://zapier.com/dashboard/auth/oauth/return/App222291CLIAPI/',
  response_type: 'code',
  code_challenge: 'BSupaW6JDyiPDgU4HM8wkLj94DELW0BvsxPAoO2d5XA',
  code_challenge_method: 'S256'
}

const validClientInfo = {
  name: 'Test App',
  description: 'Test Description',
  scopes: [
    { name: 'conversion', description: 'Access to conversion data' }
  ]
}

// helper function
const createUrlWithParams = (params) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value)
    }
  })
  return `?${searchParams.toString()}`
}

// Mock window.location
const mockLocation = new URL('https://example.com')
delete window.location
window.location = mockLocation

describe('ConsentView', () => {
  beforeEach(() => {
    global.fetch.mockReset()
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        name: 'Test App',
        description: 'Test Description',
        scopes: [
          { name: 'conversion', description: 'Access to conversion data' }
        ]
      })
    })
  })

  describe('Authorization Flow', () => {
    test('handles authorization flow correctly', async () => {
      window.location.search = createUrlWithParams(validParams)
      const wrapper = mount(ConsentView)

      // Wait for initial client info fetch and component update
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()
      
      // Verify component is in the correct state
      expect(wrapper.find('.error-container').exists()).toBe(false)
      expect(wrapper.find('.consent-container').exists()).toBe(true)
      expect(wrapper.find('.authorize-btn').exists()).toBe(true)
      
      const mockCode = 'test_auth_code'
      
      // Store the initial fetch call count to track the authorization call
      const initialFetchCalls = global.fetch.mock.calls.length
      
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ code: mockCode })
        })
      )
      
      await wrapper.find('.authorize-btn').trigger('click')
      await wrapper.vm.$nextTick()
      
      // Get the authorization request call (should be the latest fetch call)
      const authCall = global.fetch.mock.calls[initialFetchCalls]
      expect(authCall).toBeTruthy()
      
      // Verify the POST request URL and method
      const [requestUrl, requestInit] = authCall
      expect(requestUrl).toContain('/oauth/authorize')
      expect(requestInit).toEqual(expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object)
      }))

      // Verify all required parameters are included in the authorization URL
      const authUrlParams = new URL(requestUrl).searchParams
      const expectedAuthParams = {
        client_id: validParams.client_id,
        redirect_uri: validParams.redirect_uri,
        response_type: validParams.response_type,
        scope: validParams.scope,
        code_challenge: validParams.code_challenge,
        code_challenge_method: validParams.code_challenge_method
      }
      
      Object.entries(expectedAuthParams).forEach(([key, value]) => {
        expect(authUrlParams.get(key)).toBe(value)
      })

      // Verify final redirect URL includes code and state
      const expectedRedirectUrl = new URL(validParams.redirect_uri)
      expectedRedirectUrl.searchParams.append('code', mockCode)
      expectedRedirectUrl.searchParams.append('state', validParams.state)
      expect(window.location.href).toBe(expectedRedirectUrl.toString())
    })
  })

  describe('Parameter Validation', () => {
    test('renders correctly with all valid parameters', async () => {
      // Set URL with all parameters
      window.location.search = createUrlWithParams(validParams)
      
      const wrapper = mount(ConsentView)
      await wrapper.vm.$nextTick()
      
      // Wait for API call to resolve
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.find('.error-container').exists()).toBe(false)
      expect(wrapper.find('.consent-container').exists()).toBe(true)
    })

    // Test each required parameter
    const requiredParams = [
      'client_id',
      'scope',
      'redirect_uri',
      'response_type',
      'code_challenge',
      'code_challenge_method'
    ]

    requiredParams.forEach(param => {
      test(`shows error when ${param} is missing`, async () => {
        // Create params object without the current parameter
        const paramsWithoutOne = { ...validParams }
        delete paramsWithoutOne[param]
        
        window.location.search = createUrlWithParams(paramsWithoutOne)
        
        const wrapper = mount(ConsentView)
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.error-container').exists()).toBe(true)
        expect(wrapper.find('.consent-container').exists()).toBe(false)
      })

      test(`shows error when ${param} is empty`, async () => {
        // Create params object with empty parameter
        const paramsWithEmptyValue = { ...validParams, [param]: '' }
        
        window.location.search = createUrlWithParams(paramsWithEmptyValue)
        
        const wrapper = mount(ConsentView)
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.error-container').exists()).toBe(true)
        expect(wrapper.find('.consent-container').exists()).toBe(false)
      })
    })
  })

  describe('API Integration', () => {
    test('fetches client info successfully', async () => {
      window.location.search = createUrlWithParams(validParams)
      
      const wrapper = mount(ConsentView)
      await wrapper.vm.$nextTick()
      
      // Wait for API call to resolve
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://dev-api.orqestra.io/oauth/scopes'),
        expect.any(Object)
      )
      
      expect(wrapper.find('.loading-container').exists()).toBe(false)
      expect(wrapper.find('.consent-container').exists()).toBe(true)
      expect(wrapper.find('.app-description').text()).toBe('Test Description')
    })

    test('shows error on API failure', async () => {
      // Mock API failure
      global.fetch.mockRejectedValueOnce(new Error('API Error'))
      
      window.location.search = createUrlWithParams(validParams)
      
      const wrapper = mount(ConsentView)
      await wrapper.vm.$nextTick()
      
      // Wait for API call to reject
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.consent-container').exists()).toBe(false)
    })
  })

  describe('User Interactions', () => {
    test('authorize button triggers authorization flow', async () => {
      window.location.search = createUrlWithParams(validParams)
      
      const wrapper = mount(ConsentView)
      await wrapper.vm.$nextTick()
      
      // Wait for initial API call to resolve
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Mock successful authorization
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ code: 'test_auth_code' })
        })
      )
      
      const authorizeButton = wrapper.find('.authorize-btn')
      await authorizeButton.trigger('click')
      
      // Wait for authorization API call
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://dev-api.orqestra.io/oauth/authorize'),
        expect.any(Object)
      )
    })

    test('displays previously consented messaging when applicable', async () => {
      window.location.search = createUrlWithParams(validParams)
      
      // Mock client info with previously_consented set to true
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            name: 'Test App',
            description: 'Test Description',
            previously_consented: true,
            scope_description: ['Access to conversion data']
          }
        })
      })
      
      const wrapper = mount(ConsentView)
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verify the messaging reflects previous consent
      const text = wrapper.text()
      expect(text).toContain('would like to continue accessing')
      expect(text).toContain('This will continue allowing')
      expect(wrapper.find('.consent-container').exists()).toBe(true)
    })

    test('cancel button exists', async () => {
      window.location.search = createUrlWithParams(validParams)
      
      const wrapper = mount(ConsentView)
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(wrapper.find('.cancel-btn').exists()).toBe(true)
    })
  })

  describe('Loading States', () => {
    test('shows loading state while fetching client info', async () => {
      // Delay API response
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              name: 'Test App',
              description: 'Test Description',
              scopes: []
            }
          })
        }), 100))
      )
      
      window.location.search = createUrlWithParams(validParams)
      
      const wrapper = mount(ConsentView)
      expect(wrapper.find('.loading-container').exists()).toBe(true)
      
      // Wait for API call to resolve
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.loading-container').exists()).toBe(false)
      expect(wrapper.find('.consent-container').exists()).toBe(true)
    })
  })
}) 