import { useCallback } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { clearAuth } from '../../store/authSlice'
import { addToast } from '../../store/uiSlice'
import { apolloClient } from '../../api/ApolloClient'
import { LOGOUT } from '../../api/queries'
import type { LogoutData } from '../../api/types'

export function useLogout() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const [logoutMutation, { loading }] = useMutation<LogoutData>(LOGOUT)

    const logout = useCallback(async () => {
        try {
            const { data } = await logoutMutation()

            if (data?.auth.logout.error) {
                dispatch(addToast({
                    type: 'error',
                    message: data.auth.logout.error.message,
                }))
                return
            }

            dispatch(clearAuth())
            await apolloClient.clearStore()
            navigate('/login')
            dispatch(addToast({ type: 'success', message: 'Ви вийшли з акаунту' }))
        } catch {
            dispatch(addToast({ type: 'error', message: 'Помилка виходу' }))
        }
    }, [logoutMutation, dispatch, navigate])

    return { logout, loading }
}