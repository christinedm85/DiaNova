import { useState, useEffect, useRef } from 'react'

/**
 * Animated counter that counts up from 0 to the target value.
 * Respects prefers-reduced-motion.
 */
export default function useCountUp(target, { duration = 1200, enabled = true } = {}) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !enabled) {
      setValue(target)
      return
    }

    const startValue = 0
    const diff = target - startValue

    if (diff === 0) {
      setValue(target)
      return
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(startValue + diff * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, enabled])

  return value
}
