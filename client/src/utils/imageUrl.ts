export const getImageUrl = (url?: string | null) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${import.meta.env.VITE_API_BASE_URL}${url}`
}
