import { onLCP, onINP, onCLS } from 'web-vitals'

export function initPerformanceMonitoring() {
  onLCP((metric) => {
    console.log('[Performance] LCP:', metric.value)
  })

  onINP((metric) => {
    console.log('[Performance] INP:', metric.value)
  })

  onCLS((metric) => {
    console.log('[Performance] CLS:', metric.value)
  })
}