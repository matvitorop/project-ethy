import { Routes, Route } from 'react-router-dom'
import AuthInitializer from './components/AuthInitializer'
import AppLayout from './layout/AppLayout'
import PublicLayout from './layout/PublicLayout'
import PrivateRoute from './components/PrivateRoute'
import ToastContainer from './components/Toast'
import HomePage from './pages/HomePage'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'

export default function App() {
    return (
        <AuthInitializer>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route element={<AppLayout />}>
                        {/* Авторизовані сторінки */}
                    </Route>
                </Route>
            </Routes>

            <ToastContainer />
        </AuthInitializer>
    )
}