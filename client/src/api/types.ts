export interface ApiError {
    code: string
    message: string
}

export interface AuthPayload {
    token: string | null
    error: ApiError | null
}

export interface LoginData {
    auth: { login: AuthPayload }
}

export interface LoginVars {
    email: string
    password: string
}

export interface RegisterData {
    auth: { register: AuthPayload }
}

export interface RegisterVars {
    username: string
    email: string
    password: string
}

export interface LogoutData {
    auth: {
        logout: {
            message: string | null
            error: ApiError | null
        }
    }
}

export interface ProfileData {
    user: {
        profile: {
            profile: {
                id: string
                username: string
                email: string
                registeredAtUtc: string
            } | null
            error: ApiError | null
        }
    }
}