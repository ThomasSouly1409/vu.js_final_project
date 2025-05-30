import { createFetch } from "ofetch";

let _api

export function useApi() {
  if (_api) {
    return _api
  }
  _api = createFetch({
    defaults: {
      baseURL: import.meta.env.VITE_API_HOST,
      onRequest({ options }) {
        options.headers.set('X-Api-Key', import.meta.env.VITE_API_KEY)
      },
      onResponse({ response }) {
      }
    }
  })

  return _api
}