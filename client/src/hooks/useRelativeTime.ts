import { useState, useEffect } from 'react'

function getPlural(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) {
        return one;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return few;
    }
    return many;
}

/**
 * Returns a human-readable relative time string that auto-updates every `intervalMs` ms.
 * Returns an empty string when `date` is null.
 */
export function useRelativeTime(date: Date | null, intervalMs = 15_000): string {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs)
        return () => clearInterval(id)
    }, [intervalMs])

    if (!date) return ''

    const diff = Math.floor((now - date.getTime()) / 1000)
    if (diff < 10) return 'щойно'
    if (diff < 60) return `${diff} ${getPlural(diff, 'секунду', 'секунди', 'секунд')} тому`
    
    if (diff < 3600) {
        const mins = Math.floor(diff / 60)
        return `${mins} ${getPlural(mins, 'хвилину', 'хвилини', 'хвилин')} тому`
    }
    
    const totalHours = Math.floor(diff / 3600)
    if (totalHours < 24) {
        return `${totalHours} ${getPlural(totalHours, 'годину', 'години', 'годин')} тому`
    }
    
    const days = Math.floor(totalHours / 24)
    const remainingHours = totalHours % 24
    
    if (remainingHours > 0) {
        return `${days} ${getPlural(days, 'день', 'дні', 'днів')} і ${remainingHours} ${getPlural(remainingHours, 'годину', 'години', 'годин')} тому`
    }
    
    return `${days} ${getPlural(days, 'день', 'дні', 'днів')} тому`
}
