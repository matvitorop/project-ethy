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
    userQuery: {
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

export type HelpRequestStatus =
    | 'Draft'
    | 'Open'
    | 'InProgress'
    | 'Resolved'
    | 'Cancelled'

export interface HelpRequestListItem {
    id: string
    title: string
    status: number
    previewImageUrl: string | null
    createdAt: string
}

export interface HelpRequestsPageData {
    helpRequestQuer: {
        helpRequestQuery: {
            items: HelpRequestListItem[]
            error: ApiError | null
        }
    }
}