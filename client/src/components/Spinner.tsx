export default function Spinner({ size = 20 }: { size?: number }) {
    return (
        <div
            className="border-2 border-border border-t-primary rounded-full animate-spin"
            style={{ width: size, height: size }}
        />
    )
}

export function PageSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size={32} />
        </div>
    )
}