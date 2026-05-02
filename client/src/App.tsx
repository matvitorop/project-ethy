import { Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import PublicLayout from './layout/PublicLayout'
import HomePage from './pages/HomePage'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<AppLayout />}>
        {/* Тут будуть авторизовані сторінки */}
      </Route>
    </Routes>
  )
}