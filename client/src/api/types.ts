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

export interface HelpRequestDetail {
    id: string
    title: string
    description: string
    status: number
    creatorId: string
    latitude: number | null
    longitude: number | null
    createdAtUtc: string
    imageUrls: string[]
}

export interface HelpRequestDetailData {
    helpRequestQuer: {
        helpRequestById: {
            item: HelpRequestDetail | null
            error: ApiError | null
        }
    }
}

export interface StageItem {
    id: string
    proposedByUserId: string
    content: string
    status: number
    rejectionReason: string | null
    createdAtUtc: string
    resolvedAtUtc: string | null
}

export interface StagesData {
    helpRequestQuer: {
        stages: {
            items: StageItem[] | null
            error: ApiError | null
        }
    }
}

export interface EventLogItem {
    id: string
    actorId: string
    eventType: number
    payload: string
    createdAtUtc: string
}

export interface EventLogData {
    helpRequestQuer: {
        eventLog: {
            items: EventLogItem[] | null
            error: ApiError | null
        }
    }
}

export interface CreateHelpRequestData {
    helpRequest: {
        createHelpRequest: {
            data: { id: string } | null
            error: ApiError | null
        }
    }
}

export interface RespondToHelpRequestData {
    helpRequest: {
        respondToHelpRequest: {
            responseId: string | null
            error: ApiError | null
        }
    }
}