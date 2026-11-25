export function apiFetch(path: string, options?: RequestInit) {
  const baseUrl = import.meta.env.VITE_API_URL?.trim()

  if (!baseUrl) {
    throw new Error('Falta configurar VITE_API_URL en .env')
  }

  return fetch(`${baseUrl.replace(/\/$/, '')}${path}`, options)
}
