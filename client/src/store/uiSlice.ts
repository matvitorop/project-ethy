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
    chatPanelOpen: boolean
    activeChatId: string | null
}

const uiSlice = createSlice({
    name: 'ui',
    initialState: { toasts: [], globalLoading: false, chatPanelOpen: false, activeChatId: null} as UiState,
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

        toggleChatPanel: (state) => {
            state.chatPanelOpen = !state.chatPanelOpen
            if (!state.chatPanelOpen) state.activeChatId = null
        },
        openChat: (state, action: PayloadAction<string>) => {
            state.chatPanelOpen = true
            state.activeChatId = action.payload
        },
        closeChatPanel: (state) => {
            state.chatPanelOpen = false
            state.activeChatId = null
        },
    },
})

export const { addToast, removeToast, setGlobalLoading, toggleChatPanel, openChat, closeChatPanel } = uiSlice.actions
export default uiSlice.reducer