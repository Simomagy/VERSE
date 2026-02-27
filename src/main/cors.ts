import { session } from 'electron'

const ALLOWED_ORIGINS = ['https://uexcorp.space', 'https://api.star-citizen.wiki']

/**
 * Patcha le response headers del server UEX per consentire le richieste
 * dal renderer di Electron soggetto a CORS.
 *
 * Il server UEX manda già Access-Control-Allow-Origin: * per i dati pubblici,
 * ma non include 'secret-key' in Access-Control-Allow-Headers.
 * Rimuoviamo i CORS header originali e li sostituiamo con i nostri.
 */
export function setupCorsHeaders(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isUexRequest = ALLOWED_ORIGINS.some((origin) => details.url.startsWith(origin))

    if (!isUexRequest) {
      callback({ responseHeaders: details.responseHeaders })
      return
    }

    // Copia gli headers esistenti rimuovendo tutti i CORS header
    // (le chiavi in Electron sono lowercase)
    const headers = { ...details.responseHeaders }
    delete headers['access-control-allow-origin']
    delete headers['access-control-allow-methods']
    delete headers['access-control-allow-headers']
    delete headers['access-control-allow-credentials']

    callback({
      responseHeaders: {
        ...headers,
        'access-control-allow-origin': ['*'],
        'access-control-allow-methods': ['GET, POST, DELETE, OPTIONS'],
        'access-control-allow-headers': [
          'Content-Type, Authorization, secret-key, X-Client-Version'
        ]
      }
    })
  })
}
