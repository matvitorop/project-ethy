import { useState, useEffect } from 'react'

/**
 * Returns a human-readable relative time string that auto-updates every `intervalMs` ms.
 * Returns an empty string when `date` is null.
 */
export function useRelativeTime(date: Date | null, intervalMs = 15_000): string {
    const [, setTick] = useState(0)

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), intervalMs)
        return () => clearInterval(id)
    }, [intervalMs])

    if (!date) return ''

    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 10) return 'щойно'
    if (diff < 60) return `${diff} с тому`
    if (diff < 3600) return `${Math.floor(diff / 60)} хв тому`
    return `${Math.floor(diff / 3600)} год тому`
}
