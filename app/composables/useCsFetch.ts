import type { $Fetch, FetchOptions } from 'ofetch'

export function useCsFetch<T = any>(
  request: string,
  options: FetchOptions & { auth?: boolean } = {}
) {
    const config = useRuntimeConfig()
  
    const defaults: FetchOptions = {
        baseURL: config.public.apiBaseUrl,
        ...options,
    }

    return $fetch<T>(request, defaults as any)
}