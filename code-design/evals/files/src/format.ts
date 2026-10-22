const UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

/** Human readable size for logs and progress lines. */
export function formatBytes(bytes: number, decimals = 0): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-'
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(decimals)} ${UNITS[unit]}`
}
