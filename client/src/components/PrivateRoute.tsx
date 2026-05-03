import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export default function PrivateRoute() {
    const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated)
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}