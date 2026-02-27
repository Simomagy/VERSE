import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { UEXResponse } from './types'

const API_BASE_URL = 'https://api.uexcorp.space/2.0'

// Rate limit da docs: 10 req/min (daily quota 14400)
const RATE_LIMIT_PER_MINUTE = 10
const RATE_LIMIT_WINDOW = 60 * 1000

// Endpoint che richiedono header 'secret-key' (token personale utente)
const USER_SECRET_KEY_ENDPOINTS = ['/fleet', '/user_trades']

// Endpoint senza autenticazione (Autorização: — nella doc)
const PUBLIC_ENDPOINTS = [
  '/data_extract',
  '/commodities',
  '/commodities_prices',
  '/commodities_routes',
  '/commodities_averages',
  '/commodities_status',
  '/items_prices_all',
  '/terminals',
  '/planets',
  '/moons',
  '/orbits',
  '/space_stations',
  '/star_systems',
  '/cities',
  '/outposts',
  '/game_versions',
  '/refineries_methods',
  '/refineries_yields',
  '/refineries_capacities'
]

class RateLimiter {
  private requests: number[] = []
  private readonly limit: number
  private readonly window: number

  constructor(limit: number, window: number) {
    this.limit = limit
    this.window = window
  }

  async acquire(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter((time) => now - time < this.window)

    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0]
      const waitTime = this.window - (now - oldestRequest)
      console.warn(`[UEX] Rate limit reached. Waiting ${waitTime}ms...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      return this.acquire()
    }

    this.requests.push(now)
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter((time) => now - time < this.window)
    return this.limit - this.requests.length
  }
}

class UEXClient {
  private client: AxiosInstance
  private rateLimiter: RateLimiter
  private appToken: string = ''
  private userToken: string = ''
  private tokensLoaded: Promise<void>

  constructor() {
    this.rateLimiter = new RateLimiter(RATE_LIMIT_PER_MINUTE, RATE_LIMIT_WINDOW)

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000
    })
    // Content-Type solo per richieste con body (POST/PUT/PATCH)
    this.client.defaults.headers.post['Content-Type'] = 'application/json'

    this.setupInterceptors()
    this.tokensLoaded = this.loadTokens()
  }

  private async loadTokens(): Promise<void> {
    try {
      this.appToken = await window.api.token.getAppToken()
      this.userToken = await window.api.token.getUserToken()
      console.log('[UEX] Tokens loaded:', {
        hasAppToken: !!this.appToken,
        hasUserToken: !!this.userToken
      })
    } catch (error) {
      console.error('[UEX] Failed to load tokens:', error)
    }
  }

  async setAppToken(token: string): Promise<void> {
    this.appToken = token
    await window.api.token.setAppToken(token)
    console.log('[UEX] App token updated')
  }

  async setUserToken(token: string): Promise<void> {
    this.userToken = token
    await window.api.token.setUserToken(token)
    console.log('[UEX] User token updated')
  }

  async reloadTokens(): Promise<void> {
    await this.loadTokens()
  }

  getAppToken(): string { return this.appToken }
  getUserToken(): string { return this.userToken }
  getRemainingRequests(): number { return this.rateLimiter.getRemainingRequests() }

  private isUserSecretKeyEndpoint(url: string): boolean {
    return USER_SECRET_KEY_ENDPOINTS.some((endpoint) => url.includes(endpoint))
  }

  private isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint))
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        await this.tokensLoaded
        await this.rateLimiter.acquire()

        const url = config.url || ''

        if (this.isUserSecretKeyEndpoint(url)) {
          // fleet e user_trades: richiedono header 'secret-key' con token personale
          if (this.userToken) {
            config.headers['secret-key'] = this.userToken
          }
          // Rimuove Bearer se presente
          delete config.headers['Authorization']
        } else if (!this.isPublicEndpoint(url)) {
          // Altri endpoint autenticati: Bearer Token dell'app
          if (this.appToken) {
            config.headers['Authorization'] = `Bearer ${this.appToken}`
          }
        }

        console.log(
          `[UEX] ${config.method?.toUpperCase()} ${url} (${this.rateLimiter.getRemainingRequests()} left)`
        )

        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => {
        const data = response.data as UEXResponse<any>
        if (data.status === 'error') throw new Error(data.message || 'API error')
        if (data.status === 'requests_limit_reached') throw new Error('Rate limit exceeded.')
        return response
      },
      (error: AxiosError<any>) => {
        const status = error.response?.status
        const message = error.response?.data?.message || error.message

        if (status === 403) throw new Error(`Access denied (403): ${message}`)
        if (status === 401) throw new Error('Invalid or missing API token (401).')
        if (status === 429) throw new Error('Too many requests (429). Please wait.')
        if (error.code === 'ECONNABORTED') throw new Error('Request timeout.')

        throw new Error(`API error ${status}: ${message}`)
      }
    )
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<UEXResponse<T>>(url, { params })
    // Se response.data.data è undefined/null, ritorniamo undefined (o il chiamante deve gestire)
    // Ma per evitare il crash "cannot be undefined", possiamo assicurarci che non ritorni undefined se T è string
    return response.data.data as T
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<UEXResponse<T>>(url, data)
    return response.data.data as T
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<UEXResponse<T>>(url)
    return response.data.data as T
  }
}

export const uexClient = new UEXClient()
