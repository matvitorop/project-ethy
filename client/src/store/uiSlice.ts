import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    type: ToastType
    message: string
}

interface UiState {
    toasts: Toast[]
    globalLoading: boolean
}

const uiSlice = createSlice({
    name: 'ui',
    initialState: { toasts: [], globalLoading: false } as UiState,
    reducers: {
        addToast: (state, action: PayloadAction<{ type: ToastType; message: string }>) => {
            state.toasts.push({
                id: crypto.randomUUID(),
                type: action.payload.type,
                message: action.payload.message,
            })
        },
        removeToast: (state, action: PayloadAction<string>) => {
            state.toasts = state.toasts.filter(t => t.id !== action.payload)
        },
        setGlobalLoading: (state, action: PayloadAction<boolean>) => {
            state.globalLoading = action.payload
        },
    },
})

export const { addToast, removeToast, setGlobalLoading } = uiSlice.actions
export default uiSlice.reducer