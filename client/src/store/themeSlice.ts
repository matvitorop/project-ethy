import { createSlice } from '@reduxjs/toolkit'

type Theme = 'light' | 'dark'

const getInitialTheme = (): Theme => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

interface ThemeState {
    current: Theme
}

const themeSlice = createSlice({
    name: 'theme',
    initialState: (): ThemeState => ({ current: getInitialTheme() }),
    reducers: {
        toggleTheme: (state) => {
            state.current = state.current === 'light' ? 'dark' : 'light'
            localStorage.setItem('theme', state.current)
            document.documentElement.setAttribute('data-theme', state.current)
        },
        initTheme: (state) => {
            document.documentElement.setAttribute('data-theme', state.current)
        },
    },
})

export const { toggleTheme, initTheme } = themeSlice.actions
export default themeSlice.reducer