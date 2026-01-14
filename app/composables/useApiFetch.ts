import type { UseFetchOptions } from '#app'

export function useApiFetch<T>(
  request: string,
  options: UseFetchOptions<T> & { auth?: boolean } = {}
) {
  const config = useRuntimeConfig()
  const headers = useRequestHeaders(['cookie']) as HeadersInit

  const defaultOptions: UseFetchOptions<T> = {
    baseURL: config.public.apiBaseUrl,
    watch: false,
    headers: headers
  }

  const mergedOptions: UseFetchOptions<T> = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  return useFetch(request, mergedOptions)
}