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
                phoneNumber: string | null
                socialLinks: string | null
                isEmailVerified: boolean
                role: string
                activeRequestsCount: number
                activeResponsesCount: number
                totalRequests: number
                completedRequests: number
                helpedRequests: number
                rejectedRequests: number
                dailyComplaintsCount: number
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
    assignedUserId: string | null
    latitude: number | null
    longitude: number | null
    createdAtUtc: string
    creatorUsername: string
    assignedUsername: string | null
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

export interface EditHelpRequestData {
    helpRequest: {
        editHelpRequest: {
            success: boolean
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

export interface HelpRequestResponse {
    id: string
    userId: string
    username: string
    message: string
    status: number
    createdAtUtc: string
}

export interface HelpRequestResponsesData {
    helpRequestQuer: {
        helpRequestResponses: {
            items: HelpRequestResponse[] | null
            error: ApiError | null
        }
    }
}

export interface AssignExecutorData {
    helpRequest: {
        assignExecutor: {
            data: {
                helpRequestId: string
                assignedUserId: string
            } | null
            error: ApiError | null
        }
    }
}

export interface ChatListItem {
    chatId: string
    helpRequestId: string
    helpRequestTitle: string
    ownerId: string
    assigneeId: string
    createdAtUtc: string
}

export interface MyChatsData {
    helpRequestQuer: {
        myChats: {
            items: ChatListItem[] | null
            error: ApiError | null
        }
    }
}

export interface ChatMessage {
    id: string
    senderId: string
    content: string
    createdAtUtc: string
}

export interface ChatMessagesData {
    helpRequestQuer: {
        chatMessages: {
            messages: ChatMessage[] | null
            error: ApiError | null
        }
    }
}

export interface StageEvent {
    stageId: string
    proposedByUserId?: string
    content?: string
    confirmedByUserId?: string
    rejectedByUserId?: string
    reason?: string
    deletedByUserId?: string
    createdAtUtc?: string
    resolvedAtUtc?: string
}

export interface UpdateUsernameData {
    auth: {
        updateUsername: {
            success: boolean
            error: ApiError | null
        }
    }
}

export interface ChangePasswordData {
    auth: {
        changePassword: {
            success: boolean
            error: ApiError | null
        }
    }
}

export interface DeleteAccountData {
    auth: {
        deleteAccount: {
            success: boolean
            error: ApiError | null
        }
    }
}

export interface ReportItem {
    id: string
    createdByUserId: string
    lastAssignedUserId: string | null
    comment: string
    imageUrl: string | null
    createdAtUtc: string
}

export interface ReportsData {
    helpRequestQuer: {
        reports: {
            items: ReportItem[] | null
            error: ApiError | null
        }
    }
}

export interface CreateReportData {
    helpRequest: {
        createReport: {
            reportId: string | null
            error: ApiError | null
        }
    }
}

export interface PendingReportsData {
    helpRequestQuer: {
        helpRequestQuery: {
            items: HelpRequestListItem[]
            error: ApiError | null
        }
    }
}

export interface ChangeHelpRequestStatusData {
    helpRequest: {
        changeHelpRequestStatus: {
            data: {
                id: string
                status: string
            } | null
            error: ApiError | null
        }
    }
}
export interface UserReviewItem {
    id: string
    helpRequestId: string
    reviewerUserId: string
    reviewerUsername: string
    isPositive: boolean
    comment: string | null
    createdAtUtc: string
}

export interface GetUserReviewsData {
    userQuery: {
        getUserReviews: {
            reviews: UserReviewItem[] | null
            error: ApiError | null
        }
    }
}

export interface LeaveReviewData {
    user: {
        leaveReview: {
            reviewId: string | null
            error: ApiError | null
        }
    }
}

export interface LeaveComplaintData {
    user: {
        leaveComplaint: {
            complaintId: string | null
            error: ApiError | null
        }
    }
}

export interface UpdateProfileData {
    user: {
        updateProfile: {
            success: boolean
            error: ApiError | null
        }
    }
}

export interface ResignAsExecutorData {
    helpRequest: {
        resignAsExecutor: {
            success: boolean
            error: ApiError | null
        }
    }
}

export interface RemoveExecutorData {
    helpRequest: {
        removeExecutor: {
            success: boolean
            error: ApiError | null
        }
    }
}

// ========================
// Admin module types
// ========================

export interface PublicProfileDto {
    id: string
    username: string
    role: number
    registeredAtUtc: string
    isEmailVerified: boolean
    hasPhone: boolean
    hasSocialLinks: boolean
    positiveReviews: number
    negativeReviews: number
    totalRequests: number
    completedRequests: number
    helpedRequests: number
    rejectedRequests: number
    phoneNumber: string | null
    socialLinks: string | null
}

export interface PublicProfileData {
    userQuery: {
        getPublicProfile: {
            profile: PublicProfileDto | null
            error: ApiError | null
        }
    }
}

export interface AdminHelpRequestItem {
    id: string
    title: string
    status: number
    isHidden: boolean
    isDeleted: boolean
    creatorUsername: string
    createdAtUtc: string
}

export interface AdminHelpRequestsData {
    adminQuery: {
        helpRequests: {
            items: AdminHelpRequestItem[] | null
            error: ApiError | null
        }
    }
}

export interface AdminComplaintItem {
    id: string
    reporterUserId: string
    reporterUsername: string
    targetUserId: string
    targetUsername: string
    reason: string
    isResolved: boolean
    createdAtUtc: string
}

export interface ComplaintsData {
    adminQuery: {
        complaints: {
            items: AdminComplaintItem[] | null
            error: ApiError | null
        }
    }
}

export interface VolunteerApplicationItem {
    id: string
    userId: string
    username: string
    organizationName: string
    activityDescription: string
    documentImageUrl: string | null
    status: number
    adminComment: string | null
    submittedAtUtc: string
    reviewedAtUtc: string | null
}

export interface VolunteerApplicationsData {
    adminQuery: {
        volunteerApplications: {
            items: VolunteerApplicationItem[] | null
            error: ApiError | null
        }
    }
}

export interface BlockHistoryItem {
    id: string
    adminUsername: string
    reason: string
    blockedUntilUtc: string | null
    createdAtUtc: string
}

export interface BlockHistoryData {
    adminQuery: {
        blockHistory: {
            items: BlockHistoryItem[] | null
            error: ApiError | null
        }
    }
}

export interface AdminUserDto {
    id: string
    username: string
    email: string
    role: number
    registeredAtUtc: string
    isBlocked: boolean
    blockedUntilUtc: string | null
    isDeleted: boolean
}

export interface AdminUsersData {
    adminQuery: {
        users: {
            items: AdminUserDto[] | null
            error: ApiError | null
        }
    }
}

export interface AdminUsersVars {
    page: number
    pageSize: number
    searchTerm?: string | null
    shortId?: string | null
}

export interface AdminActionData {
    admin: {
        [key: string]: {
            success: boolean | null
            error: ApiError | null
        }
    }
}

export interface ApproveHelpRequestData {
    admin: {
        approveHelpRequest: {
            success: boolean
            error: ApiError | null
        }
    }
}

export interface RejectHelpRequestData {
    admin: {
        rejectHelpRequest: {
            success: boolean
            error: ApiError | null
        }
    }
}

export interface SubmitVolunteerApplicationData {
    user: {
        submitVolunteerApplication: {
            applicationId: string | null
            error: ApiError | null
        }
    }
}

export interface VerifyEmailData {
    user: {
        verifyEmail: {
            success: boolean | null
            error: ApiError | null
        }
    }
}

export interface SendVerificationEmailData {
    user: {
        sendVerificationEmail: {
            success: boolean | null
            error: ApiError | null
        }
    }
}

export interface ResendVerificationEmailData {
    user: {
        resendVerificationEmail: {
            success: boolean | null
            error: ApiError | null
        }
    }
}

export interface MyVolunteerApplicationData {
    userQuery: {
        getMyVolunteerApplication: {
            application: {
                id: string
                status: number
                adminComment: string | null
                submittedAtUtc: string
            } | null
            error: ApiError | null
        }
    }
}

// ========================
// Statistics types
// ========================

export interface PlatformStatsDto {
    totalRequests: number
    moderationRequests: number
    openRequests: number
    inProgressRequests: number
    resolvedRequests: number
    cancelledRequests: number
    rejectedRequests: number
    totalUsers: number
    totalVolunteers: number
    completionRate: number
    avgCompletionDays: number
}

export interface PlatformStatsData {
    statsQuery: {
        platformStats: {
            stats: PlatformStatsDto | null
            error: ApiError | null
        }
    }
}

export interface MonthlyActivityItem {
    year: number
    month: number
    count: number
}

export interface MonthlyActivityData {
    statsQuery: {
        monthlyActivity: {
            items: MonthlyActivityItem[] | null
            error: ApiError | null
        }
    }
}

export interface TopVolunteerByCompleted {
    userId: string
    username: string
    completedCount: number
}

export interface TopVolunteerByReviews {
    userId: string
    username: string
    positiveReviews: number
}

export interface TopVolunteersData {
    statsQuery: {
        topVolunteers: {
            data: {
                byCompleted: TopVolunteerByCompleted[]
                byReviews: TopVolunteerByReviews[]
            } | null
            error: ApiError | null
        }
    }
}

export interface AdminAnalyticsDto {
    newRequestsThisWeek: number
    newRequestsLastWeek: number
    newUsersThisWeek: number
    pendingComplaints: number
    totalComplaints: number
    blockedUsers: number
    totalUsers: number
    totalVolunteers: number
    totalAdmins: number
}

export interface AdminAnalyticsData {
    statsQuery: {
        adminAnalytics: {
            data: AdminAnalyticsDto | null
            error: ApiError | null
        }
    }
}

export interface Notification {
    id: string
    title: string
    content: string
    type: string | number
    isRead: boolean
    createdAtUtc: string
    relatedEntityId?: string
    relatedEntityType?: string
}

export interface GetNotificationsData {
    notificationQuery: {
        notifications: {
            data: Notification[] | null
            error: ApiError | null
        }
    }
}

export interface CancelResponseData {
    helpRequest: {
        cancelResponse: {
            success: boolean
            error: ApiError | null
        }
    }
}

export interface SoftDeleteHelpRequestData {
    helpRequest: {
        softDeleteHelpRequest: {
            success: boolean
            error: ApiError | null
        }
    }
}