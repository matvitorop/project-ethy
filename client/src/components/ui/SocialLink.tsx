import { Send, X, Link as LinkIcon, Globe } from 'lucide-react'

interface SocialLinkProps {
    url: string | null | undefined
    className?: string
}

export default function SocialLink({ url, className = "" }: SocialLinkProps) {
    if (!url) return null

    // Clean URL for display
    const cleanUrl = url.trim()

    // Determine icon and label
    let Icon = LinkIcon
    let label = cleanUrl

    if (cleanUrl.startsWith('@')) {
        Icon = Send
        label = cleanUrl
    } else if (cleanUrl.includes('t.me') || cleanUrl.includes('telegram.me')) {
        Icon = Send
        // Extract username if possible: t.me/username -> @username
        const match = cleanUrl.match(/t\.me\/([^/?#]+)/)
        if (match) label = `@${match[1]}`
    } else if (cleanUrl.includes('instagram.com')) {
        Icon = Globe // Fallback because Instagram icon is missing
        const match = cleanUrl.match(/instagram\.com\/([^/?#]+)/)
        if (match) label = `@${match[1]}`
    } else if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.com')) {
        Icon = Globe
    } else if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) {
        Icon = X
    } else if (cleanUrl.startsWith('http')) {
        Icon = Globe
    }

    // Ensure it's a valid link for href
    let href = cleanUrl
    if (cleanUrl.startsWith('@')) {
        href = `https://t.me/${cleanUrl.substring(1)}`
    } else if (!cleanUrl.startsWith('http') && !cleanUrl.startsWith('viber://')) {
        href = `https://${cleanUrl}`
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-all duration-300 group border border-primary/10 hover:border-primary/30 ${className}`}
        >
            <Icon size={16} className="transition-transform group-hover:scale-110" />
            <span className="text-sm font-bold tracking-tight">{label}</span>
        </a>
    )
}
