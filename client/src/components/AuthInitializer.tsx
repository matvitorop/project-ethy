import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { useAppDispatch } from '../store/hooks'
import { setAuth, clearAuth, setInitialized } from '../store/authSlice'
import { GET_PROFILE } from '../api/queries'
import type { ProfileData } from '../api/types'
import { PageSpinner } from './Spinner'

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch()

    const { data, loading, error } = useQuery<ProfileData>(GET_PROFILE, {
        fetchPolicy: 'network-only',
    })

    useEffect(() => {
        if (loading) return

        if (error || !data) {
            dispatch(clearAuth())
            dispatch(setInitialized(true))
            return
        }

        const profile = data.userQuery.profile.profile
        if (profile) {
            dispatch(setAuth({
                userId: profile.id,
                username: profile.username,
                email: profile.email,
            }))
        } else {
            dispatch(clearAuth())
        }
        dispatch(setInitialized(true))
    }, [data, loading, error, dispatch])

    if (loading) return <PageSpinner />
    return <>{children}</>
}