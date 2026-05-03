import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
    isAuthenticated: boolean
    isInitialized: boolean
    userId: string | null
    username: string | null
    email: string | null
}

const initialState: AuthState = {
    isAuthenticated: false,
    isInitialized: false,
    userId: null,
    username: null,
    email: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<{
            userId: string
            username: string
            email: string
        }>) => {
            state.isAuthenticated = true
            state.userId = action.payload.userId
            state.username = action.payload.username
            state.email = action.payload.email
        },
        clearAuth: (state) => {
            state.isAuthenticated = false
            state.userId = null
            state.username = null
            state.email = null
        },
        setInitialized: (state, action: PayloadAction<boolean>) => {
            state.isInitialized = action.payload
        },
    },
})

export const { setAuth, clearAuth, setInitialized } = authSlice.actions
export default authSlice.reducer