import { mount } from '@vue/test-utils'
import ConsentView from '../ConsentView.vue'
import { flushPromises } from '@vue/test-utils'

// Mock fetch globally
global.fetch = jest.fn()

// Mock vue-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn()
}

// Mock route
const mockRoute = {
  query: {}
}

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
window.location = { 
  ...mockLocation, 
  assign: jest.fn(), 
  href: 'https://example.com',
  search: '' 
}

describe('ConsentView', () => {
  beforeEach(() => {
    global.fetch.mockReset()
    mockRouter.push.mockReset()
    mockRouter.replace.mockReset()
    
    // Default mock response for client info
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: {
          name: 'Test App',
          description: 'Test Description',
          display_description: 'Test Description',
          scopes: [
            { name: 'conversion', description: 'Access to conversion data' }
          ]
        }
      })
    })
    
    // Reset window.location.href and search before each test
    window.location.href = 'https://example.com'
    window.location.search = ''
  })

  // Helper to mount component with mocked router
  const mountComponent = async (params = validParams) => {
    // Set up route query params
    const queryParams = {}
    Object.entries(params).forEach(([key, value]) => {
      queryParams[key] = value
    })
    mockRoute.query = queryParams
    
    // Set the URL search params for window.location
    window.location.search = createUrlWithParams(params)
    
    const wrapper = mount(ConsentView, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter
        }
      }
    })
    
    await flushPromises()
    return wrapper
  }

  describe('Parameter Validation Core Logic', () => {
    test.each([
      'client_id',
      'scope',
      'redirect_uri',
      'response_type',
      'code_challenge',
      'code_challenge_method'
    ])('shows error when %s is missing', async (param) => {
      // Create params object without the current parameter
      const paramsWithoutOne = { ...validParams }
      delete paramsWithoutOne[param]
      
      const wrapper = await mountComponent(paramsWithoutOne)
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.consent-container').exists()).toBe(false)
    })

    test('validates response_type must be "code"', async () => {
      const params = { ...validParams, response_type: 'token' }
      const wrapper = await mountComponent(params)
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.text()).toContain('Invalid response_type')
    })

    test('validates code_challenge_method must be "S256"', async () => {
      const params = { ...validParams, code_challenge_method: 'plain' }
      const wrapper = await mountComponent(params)
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.text()).toContain('Invalid code_challenge_method')
    })
  })

  describe('Authorization Flow Core Logic', () => {
    test('happy path: complete authorization flow', async () => {
      // Step 1: Page loads with URL parameters
      window.location.search = createUrlWithParams(validParams)
      
      // Step 2: Initial GET request to fetch client info
      // Mock the fetch client info API call
      const initialFetchMock = {
        ok: true,
        json: () => Promise.resolve({
          data: {
            name: 'Test App',
            description: 'Test Description',
            display_description: 'Test Description',
            scope_description: ['Access to conversion data']
          }
        })
      }
      global.fetch.mockImplementationOnce(() => Promise.resolve(initialFetchMock))
      
      // Step 3: Mount component which will load with the parameters
      const wrapper = await mountComponent()
      await flushPromises()
      
      // Verify the page loaded with client info
      expect(wrapper.find('.consent-container').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test App')
      expect(wrapper.text()).toContain('Test Description')
      
      // Verify the initial client info API call happened with correct parameters
      const initialFetchCall = global.fetch.mock.calls[0]
      expect(initialFetchCall[0]).toContain('/oauth/scopes')
      expect(initialFetchCall[0]).toContain(`client_id=${validParams.client_id}`)
      expect(initialFetchCall[0]).toContain(`scope=${validParams.scope}`)
      
      // Step 4: User clicks authorize button
      // Mock the authorize API POST request
      const mockCode = 'test_auth_code'
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ code: mockCode })
        })
      )
      
      await wrapper.find('.authorize-btn').trigger('click')
      await flushPromises()
      
      // Step 5: Verify POST request happens with correct parameters
      const authFetchCall = global.fetch.mock.calls[1]
      expect(authFetchCall[0]).toContain('/oauth/authorize')
      expect(authFetchCall[1].method).toBe('POST')
      
      // Verify all the required parameters are included in the authorize URL
      const authUrl = new URL(authFetchCall[0])
      expect(authUrl.searchParams.get('client_id')).toBe(validParams.client_id)
      expect(authUrl.searchParams.get('redirect_uri')).toBe(validParams.redirect_uri)
      expect(authUrl.searchParams.get('response_type')).toBe(validParams.response_type)
      expect(authUrl.searchParams.get('scope')).toBe(validParams.scope)
      expect(authUrl.searchParams.get('code_challenge')).toBe(validParams.code_challenge)
      expect(authUrl.searchParams.get('code_challenge_method')).toBe(validParams.code_challenge_method)
      
      // Step 6: Verify final redirect URL includes code and state
      const expectedRedirectUrl = new URL(validParams.redirect_uri)
      expectedRedirectUrl.searchParams.append('code', mockCode)
      expectedRedirectUrl.searchParams.append('state', validParams.state)
      expect(window.location.href).toBe(expectedRedirectUrl.toString())
    })

    test('sad path: authorization fails and shows error', async () => {
      // Step 1-3: Load the component successfully first
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              name: 'Test App',
              description: 'Test Description',
              scope_description: ['Access to conversion data']
            }
          })
        })
      )
      
      const wrapper = await mountComponent()
      await flushPromises()
      
      // Verify component loaded correctly
      expect(wrapper.find('.consent-container').exists()).toBe(true)
      
      // Step 4: User clicks authorize, but the authorization fails
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ message: 'Authorization failed' })
        })
      )
      
      await wrapper.find('.authorize-btn').trigger('click')
      await flushPromises()
      
      // Verify error is shown
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.consent-container').exists()).toBe(false)
    })
  })

  describe('Client Info API Core Logic', () => {
    test('happy path: client info loads successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            name: 'Test App',
            description: 'Test Description',
            display_description: 'Custom Description', // Note the custom description
            scope_description: ['Access to conversion data']
          }
        })
      })
      
      const wrapper = await mountComponent()
      
      expect(wrapper.find('.error-container').exists()).toBe(false)
      expect(wrapper.find('.app-description').text()).toBe('Custom Description')
      expect(wrapper.find('.scope-item').exists()).toBe(true)
    })

    test('uses description as fallback when display_description is missing', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            name: 'Test App',
            description: 'Fallback Description',
            // No display_description
            scope_description: ['Access to conversion data']
          }
        })
      })
      
      const wrapper = await mountComponent()
      
      expect(wrapper.find('.app-description').text()).toBe('Fallback Description')
    })

    test('sad path: client info API fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' })
      })
      
      const wrapper = await mountComponent()
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.consent-container').exists()).toBe(false)
    })
  })

  describe('Previously Consented UI Logic', () => {
    test('shows different messaging for previously consented apps', async () => {
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
      
      const wrapper = await mountComponent()
      
      const consentTitle = wrapper.find('.consent-title')
      expect(consentTitle.text()).toContain('would like to continue accessing')
      
      const permissionsHeading = wrapper.find('.permissions h2')
      expect(permissionsHeading.text()).toContain('This will continue allowing')
    })

    test('shows standard messaging for new consent', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            name: 'Test App',
            description: 'Test Description',
            previously_consented: false, // explicitly false
            scope_description: ['Access to conversion data']
          }
        })
      })
      
      const wrapper = await mountComponent()
      
      const consentTitle = wrapper.find('.consent-title')
      expect(consentTitle.text()).toContain('wants to access')
      
      const permissionsHeading = wrapper.find('.permissions h2')
      expect(permissionsHeading.text()).toContain('This will allow')
    })
  })

  describe('Loading State Logic', () => {
    test('shows loading state until client info is fetched', async () => {
      // Create a delayed promise for API response
      let resolveApi;
      const apiPromise = new Promise(resolve => {
        resolveApi = resolve;
      });
      
      global.fetch.mockImplementationOnce(() => apiPromise)
      
      // Set URL with parameters
      window.location.search = createUrlWithParams(validParams)
      mockRoute.query = validParams
      
      // Mount component
      const wrapper = mount(ConsentView, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter
          }
        }
      })
      
      // Verify loading state is shown
      expect(wrapper.find('.loading-container').exists()).toBe(true)
      expect(wrapper.find('.loader').exists()).toBe(true)
      expect(wrapper.text()).toContain('Loading application details')
      
      // Resolve API call
      resolveApi({
        ok: true,
        json: () => Promise.resolve({
          data: {
            name: 'Test App',
            description: 'Test Description',
            scope_description: ['Access to conversion data']
          }
        })
      })
      
      await flushPromises()
      
      // Verify loading state is gone and content is shown
      expect(wrapper.find('.loading-container').exists()).toBe(false)
      expect(wrapper.find('.consent-container').exists()).toBe(true)
    })
  })

  describe('Cancel Button Logic', () => {
    test('cancel button tries window.history.back first', async () => {
      // Mock window.history
      const originalHistory = window.history
      const mockHistoryBack = jest.fn()
      
      // Need to inspect the actual component implementation
      // The issue might be that the component is checking window.history.length > 1
      // But our mock isn't being used properly
      
      // Create a spy on the original history.back method
      const originalBack = window.history.back
      window.history.back = mockHistoryBack
      
      // Make sure length is greater than 1
      Object.defineProperty(window.history, 'length', {
        configurable: true,
        value: 2
      })
      
      const wrapper = await mountComponent()
      
      // Click cancel button
      await wrapper.find('.cancel-btn').trigger('click')
      await flushPromises()
      
      // Verify history.back was called
      expect(mockHistoryBack).toHaveBeenCalled()
      
      // Restore original window.history
      window.history.back = originalBack
    })
    
    test('cancel button redirects to home when no history', async () => {
      // Save original properties
      const originalHistoryBack = window.history.back
      const originalLocationHref = window.location.href
      
      // Mock window.history with length 1
      const mockHistoryBack = jest.fn()
      window.history.back = mockHistoryBack
      
      // Set history length to 1 (no history)
      Object.defineProperty(window.history, 'length', {
        configurable: true,
        value: 1
      })
      
      // Make sure we can track changes to window.location.href
      // Create a setter for window.location.href
      let currentHref = 'https://example.com'
      Object.defineProperty(window.location, 'href', {
        configurable: true,
        get: () => currentHref,
        set: (value) => {
          currentHref = value
        }
      })
      
      const wrapper = await mountComponent()
      
      // Click cancel button
      await wrapper.find('.cancel-btn').trigger('click')
      await flushPromises()
      
      // Verify it didn't call history.back
      expect(mockHistoryBack).not.toHaveBeenCalled()
      
      // Verify it redirected to home
      expect(currentHref).toBe('/')
      
      // Restore original properties
      window.history.back = originalHistoryBack
      Object.defineProperty(window.location, 'href', {
        configurable: true,
        value: originalLocationHref,
        writable: true
      })
    })
  })
})
