/**
 * Форматує дату в локальний час користувача українською мовою.
 * @param dateString ISO рядок дати з сервера (UTC)
 * @param format 'full' | 'short' | 'timeOnly'
 */
export function formatDateTime(
    dateString: string | null | undefined, 
    format: 'full' | 'short' | 'timeOnly' = 'full'
): string {
    if (!dateString) return ''

    const date = new Date(dateString)
    
    // Перевірка на валідність дати
    if (isNaN(date.getTime())) return ''

    const options: Intl.DateTimeFormatOptions = {}

    if (format === 'full') {
        options.year = 'numeric'
        options.month = 'long'
        options.day = 'numeric'
        options.hour = '2-digit'
        options.minute = '2-digit'
    } else if (format === 'short') {
        options.year = '2-digit'
        options.month = 'numeric'
        options.day = 'numeric'
    } else if (format === 'timeOnly') {
        options.hour = '2-digit'
        options.minute = '2-digit'
    }

    return new Intl.DateTimeFormat('uk-UA', options).format(date)
}
