import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('apiGet returns JSON payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    )
    const { apiGet } = await import('@/services/apiClient')
    const result = await apiGet<{ ok: boolean }>('/health')
    expect(result.ok).toBe(true)
  })

  it('apiPost/apiPatch/apiDelete call fetch with expected methods', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const { apiPost, apiPatch, apiDelete } = await import('@/services/apiClient')

    await apiPost('/items', { a: 1 })
    await apiPatch('/items/1', { b: 2 })
    await apiDelete('/items/1')

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/items',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/items/1',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/items/1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('throws server message when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ message: 'custom-error' }), { status: 400 }),
        ),
    )
    const { apiGet } = await import('@/services/apiClient')

    await expect(apiGet('/bad')).rejects.toThrow('custom-error')
  })
})
