import { useAppI18n } from '../i18n'

const API_BASE_URL = '/api'

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  return parseResponse<T>(response)
}

export async function apiPost<T, TBody>(path: string, body: TBody): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
  })
  return parseResponse<T>(response)
}

export async function apiPatch<T, TBody>(path: string, body: TBody): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const { t } = useAppI18n()
    let message = `${t('requestError')}: ${response.status}`
    try {
      const payload = (await response.json()) as { message?: string }
      if (payload.message) {
        message = payload.message
      }
    } catch {
      // Keep default message when body is not JSON.
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}
