export function livenessSessionValid(): boolean {
  const ts = localStorage.getItem('vault_liveness_ts')
  if (!ts) return false
  const age = Date.now() - parseInt(ts)
  return age < 30 * 60 * 1000 // 30 minutes
}

export function clearLivenessSession(): void {
  localStorage.removeItem('vault_liveness_ts')
}
