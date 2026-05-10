import { Routes, Route } from 'react-router-dom'
import AuthInitializer from './components/AuthInitializer'
import AppLayout from './layout/AppLayout'
import PublicLayout from './layout/PublicLayout'
import PrivateRoute from './components/PrivateRoute'
import ToastContainer from './components/Toast'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import RequestsListPage from './pages/requests/RequestsListPage'
import RequestDetailsPage from './pages/requests/RequestDetailsPage'
import CreateRequestPage from './pages/requests/CreateRequestPage'
import ProfilePage from './pages/profile/ProfilePage'
import PublicProfilePage from './pages/profile/PublicProfilePage'
import AdminPage from './pages/admin/AdminPage'
import VerifyEmailPendingPage from './pages/auth/VerifyEmailPendingPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import StatsPage from './pages/StatsPage'

export default function App() {
    return (
        <AuthInitializer>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email/pending" element={<VerifyEmailPendingPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/requests" element={<RequestsListPage />} />
                        <Route path="/requests/:id" element={<RequestDetailsPage />} />
                        <Route path="/requests/new" element={<CreateRequestPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile/:userId" element={<PublicProfilePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                </Route>
            </Routes>

            <ToastContainer />
        </AuthInitializer>
    )
}