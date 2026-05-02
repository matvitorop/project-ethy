type LogoProps = {
    size?: number
    showText?: boolean
}

export default function Logo({ size = 40, showText = true }: LogoProps) {
    return (
        <div className="flex items-center gap-3">
            <svg width={size} height={size} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                <rect x="35" y="40" width="70" height="220" rx="5" fill="#0B1D3A" />
                <rect x="105" y="182" width="65" height="90" transform="rotate(-90 105 182)" fill="#0B1D3A" />
                <rect x="195" y="40" width="70" height="220" rx="5" fill="#0B1D3A" />
                <rect x="43" y="44" width="54" height="212" rx="10" fill="#FEC130" />
                <rect x="43" y="256" width="49" height="144" rx="10" transform="rotate(-90 43 256)" fill="#FEC130" />
                <rect x="43" y="174" width="49" height="144" rx="10" transform="rotate(-90 43 174)" fill="#FEC130" />
                <rect x="43" y="93" width="49" height="144" rx="10" transform="rotate(-90 43 93)" fill="#FEC130" />
            </svg>
            {showText && (
                <span className="text-2xl font-bold text-primary tracking-tight" style={{ fontFamily: 'Jua, sans-serif' }}>
                    Ethy
                </span>
            )}
        </div>
    )
}