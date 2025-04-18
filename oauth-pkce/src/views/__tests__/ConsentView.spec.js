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

  describe('Parameter Validation', () => {
    test('renders correctly with all valid parameters', async () => {
      // Set URL with all parameters
      window.location.search = createUrlWithParams(validParams)
      
      const wrapper = mount(ConsentView)
      await wrapper.vm.$nextTick()
      
      // Wait for API call to resolve
      await new Promise(resolve => setTimeout(resolve, 0))
      
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

    test('cancel button exists', async () => {
      window.location.search = createUrlWithParams(validParams)
      
      const wrapper = mount(ConsentView)
      await wrapper.vm.$nextTick()
      
      // Wait for API call to resolve
      await new Promise(resolve => setTimeout(resolve, 0))
      
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
            name: 'Test App',
            description: 'Test Description',
            scopes: []
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