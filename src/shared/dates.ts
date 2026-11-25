// "2026-03-07" → "7 mar 2026". Se arma la fecha en hora local para que no cambie de día.
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' }).format(new Date(year, month - 1, day))
}

export function todayIso() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
