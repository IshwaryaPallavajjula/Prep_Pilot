export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

export function average(values) {
  if (!values.length) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

// Weighted readiness from a breakdown of 0-100 scores.
export function calculateWeightedReadiness(breakdown) {
  const weights = {
    dsa: 0.35,
    cs: 0.2,
    systemDesign: 0.2,
    consistency: 0.1,
    revision: 0.08,
    mockPerformance: 0.07,
  }
  const total = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (breakdown[key] ?? 0) * weight
  }, 0)
  return Math.round(total)
}
