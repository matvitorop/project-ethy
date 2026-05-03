import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export default function PrivateRoute() {
    const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated)
    const isInitialized = useAppSelector(s => s.auth.isInitialized)

    if (!isInitialized) return null
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <Outlet />
}