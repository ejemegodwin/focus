export function normalizeTrace(result) {
  if (!result || !Array.isArray(result.steps)) throw new Error('Trace response is invalid')
  return result.steps.map((item) => ({
    line: Number(item.line) || 1,
    label: item.code || `line ${item.line}`,
    values: Array.isArray(item.variables) ? item.variables : [],
    stack: (Array.isArray(item.stack) ? item.stack : []).map((frame) => frame === '<module>' ? 'global' : frame),
  }))
}

export async function traceCode(code, fetcher = fetch) {
  const endpoint = import.meta.env.VITE_TRACE_API_URL || '/api/trace'
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  let result
  try {
    result = await response.json()
  } catch {
    throw new Error(`Trace service returned HTTP ${response.status}`)
  }
  if (!response.ok || result.error) throw new Error(result.error || `Trace service returned HTTP ${response.status}`)
  return { ...result, steps: normalizeTrace(result) }
}
