import { gql } from '@apollo/client'

export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    auth {
      register(username: $username, email: $email, password: $password) {
        token
        error { code message }
      }
    }
  }
`

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    auth {
      login(email: $email, password: $password) {
        token
        error { code message }
      }
    }
  }
`

export const GET_PROFILE = gql`
  query GetProfile {
    userQuery {
      profile {
        profile {
          id
          username
          email
          registeredAtUtc
          phoneNumber
          socialLinks
          isEmailVerified
          role
          activeRequestsCount
          activeResponsesCount
          totalRequests
          completedRequests
          helpedRequests
          rejectedRequests
          dailyComplaintsCount
          lastActivityAtUtc
        }
        error { code message }
      }
    }
  }
`

export const LOGOUT = gql`
  mutation Logout {
    auth {
      logout {
        message
        error { code message }
      }
    }
  }
`


export const GET_HELP_REQUESTS = gql`
  query GetHelpRequests(
    $page: Int!
    $pageSize: Int!
    $status: HelpRequestStatus
    $statuses: [HelpRequestStatus]
    $searchTerm: String
    $shortId: String
  ) {
    helpRequestQuer {
      helpRequestQuery(
        page: $page
        pageSize: $pageSize
        status: $status
        statuses: $statuses
        searchTerm: $searchTerm
        shortId: $shortId
      ) {
        items {
          id
          title
          status
          previewImageUrl
          createdAt
        }
        error { code message }
      }
    }
  }
`

export const GET_HELP_REQUEST_BY_ID = gql`
  query GetHelpRequestById($id: ID!) {
    helpRequestQuer {
      helpRequestById(id: $id) {
        item {
          id
          title
          description
          status
          creatorId
          creatorUsername
          assignedUserId
          assignedUsername
          latitude
          longitude
          createdAtUtc
          imageUrls
        }
        error { code message }
      }
    }
  }
`

export const GET_STAGES = gql`
  query GetStages($helpRequestId: ID!) {
    helpRequestQuer {
      stages(helpRequestId: $helpRequestId) {
        items {
          id
          proposedByUserId
          content
          status
          rejectionReason
          createdAtUtc
          resolvedAtUtc
        }
        error { code message }
      }
    }
  }
`

export const GET_EVENT_LOG = gql`
  query GetEventLog($helpRequestId: ID!) {
    helpRequestQuer {
      eventLog(helpRequestId: $helpRequestId) {
        items {
          id
          actorId
          eventType
          payload
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`
export const CREATE_HELP_REQUEST = gql`
  mutation CreateHelpRequest(
    $title: String!
    $description: String!
    $latitude: Float
    $longitude: Float
    $imageUrls: [String]
  ) {
    helpRequest {
      createHelpRequest(
        title: $title
        description: $description
        latitude: $latitude
        longitude: $longitude
        imageUrls: $imageUrls
      ) {
        data {
          id
        }
        error { code message }
      }
    }
  }
`

export const RESPOND_TO_HELP_REQUEST = gql`
  mutation RespondToHelpRequest($helpRequestId: ID!, $message: String!) {
    helpRequest {
      respondToHelpRequest(helpRequestId: $helpRequestId, message: $message) {
        responseId
        error { code message }
      }
    }
  }
`

export const GET_HELP_REQUEST_RESPONSES = gql`
  query GetHelpRequestResponses($helpRequestId: ID!) {
    helpRequestQuer {
      helpRequestResponses(helpRequestId: $helpRequestId) {
        items {
          id
          userId
          username
          message
          status
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`
export const ASSIGN_EXECUTOR = gql`
  mutation AssignExecutor($helpRequestId: ID!, $responseId: ID!) {
    helpRequest {
      assignExecutor(helpRequestId: $helpRequestId, responseId: $responseId) {
        data {
          helpRequestId
          assignedUserId
        }
        error { code message }
      }
    }
  }
`

export const GET_MY_CHATS = gql`
  query GetMyChats {
    helpRequestQuer {
      myChats {
        items {
          chatId
          helpRequestId
          helpRequestTitle
          ownerId
          assigneeId
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($helpRequestId: ID!) {
    helpRequestQuer {
      chatMessages(helpRequestId: $helpRequestId) {
        messages {
          id
          senderId
          content
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`


export const UPDATE_USERNAME = gql`
  mutation UpdateUsername($newUsername: String!) {
    auth {
      updateUsername(newUsername: $newUsername) {
        success
        error { code message }
      }
    }
  }
`

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword(
    $oldPassword: String!
    $newPassword: String!
    $confirmNewPassword: String!
  ) {
    auth {
      changePassword(
        oldPassword: $oldPassword
        newPassword: $newPassword
        confirmNewPassword: $confirmNewPassword
      ) {
        success
        error { code message }
      }
    }
  }
`

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount {
    auth {
      deleteAccount {
        success
        error { code message }
      }
    }
  }
`
export const GET_MY_REQUESTS = gql`
  query GetMyRequests($page: Int!, $pageSize: Int!, $creatorId: ID) {
    helpRequestQuer {
      helpRequestQuery(page: $page, pageSize: $pageSize, creatorId: $creatorId) {
        items {
          id
          title
          status
          previewImageUrl
          createdAt
        }
        error { code message }
      }
    }
  }
`

export const GET_ASSIGNEE_REQUESTS = gql`
  query GetAssigneeRequests($page: Int!, $pageSize: Int!, $assignedUserId: ID, $responderId: ID) {
    helpRequestQuer {
      helpRequestQuery(page: $page, pageSize: $pageSize, assignedUserId: $assignedUserId, responderId: $responderId) {
        items {
          id
          title
          status
          previewImageUrl
          createdAt
        }
        error { code message }
      }
    }
  }
`

export const GET_PENDING_REPORTS = gql`
  query GetPendingReports($page: Int!, $pageSize: Int!, $creatorId: ID) {
    helpRequestQuer {
      helpRequestQuery(
        page: $page
        pageSize: $pageSize
        status: Resolved
        creatorId: $creatorId
        hasNoReport: true
      ) {
        items {
          id
          title
          status
          previewImageUrl
          createdAt
        }
        error { code message }
      }
    }
  }
`

export const GET_REPORTS = gql`
  query GetReports($helpRequestId: ID!) {
    helpRequestQuer {
      reports(helpRequestId: $helpRequestId) {
        items {
          id
          createdByUserId
          lastAssignedUserId
          comment
          imageUrl
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`

export const CREATE_REPORT = gql`
  mutation CreateReport($helpRequestId: ID!, $comment: String!, $imageUrl: String) {
    helpRequest {
      createReport(
        helpRequestId: $helpRequestId
        comment: $comment
        imageUrl: $imageUrl
      ) {
        reportId
        error { code message }
      }
    }
  }
`

export const CHANGE_HELP_REQUEST_STATUS = gql`
  mutation ChangeHelpRequestStatus($helpRequestId: ID!, $status: HelpRequestStatus!) {
    helpRequest {
      changeHelpRequestStatus(helpRequestId: $helpRequestId, status: $status) {
        data {
          id
          status
        }
        error { code message }
      }
    }
  }
`

export const SOFT_DELETE_HELP_REQUEST = gql`
  mutation SoftDeleteHelpRequest($helpRequestId: ID!) {
    helpRequest {
      softDeleteHelpRequest(helpRequestId: $helpRequestId) {
        success
        error { code message }
      }
    }
  }
`


export const EDIT_HELP_REQUEST = gql`
  mutation EditHelpRequest(
    $helpRequestId: ID!, 
    $title: String!, 
    $description: String!, 
    $latitude: Float, 
    $longitude: Float,
    $imageUrls: [String]
  ) {
    helpRequest {
      editHelpRequest(
        helpRequestId: $helpRequestId
        title: $title
        description: $description
        latitude: $latitude
        longitude: $longitude
        imageUrls: $imageUrls
      ) {
        success
        error { code message }
      }
    }
  }
`

export const CANCEL_HELP_REQUEST = gql`
  mutation CancelHelpRequest($helpRequestId: ID!, $reason: String!) {
    helpRequest {
      cancelHelpRequest(helpRequestId: $helpRequestId, reason: $reason) {
        success
        error { code message }
      }
    }
  }
`

export const RESTORE_HELP_REQUEST = gql`
  mutation RestoreHelpRequest($helpRequestId: ID!) {
    helpRequest {
      restoreHelpRequest(helpRequestId: $helpRequestId) {
        success
        error { code message }
      }
    }
  }
`
export const GET_USER_REVIEWS = gql`
  query GetUserReviews($targetUserId: ID!) {
    userQuery {
      getUserReviews(targetUserId: $targetUserId) {
        reviews {
          id
          helpRequestId
          reviewerUserId
          reviewerUsername
          isPositive
          comment
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`

export const LEAVE_REVIEW = gql`
  mutation LeaveReview($helpRequestId: ID!, $isPositive: Boolean!, $comment: String) {
    user {
      leaveReview(helpRequestId: $helpRequestId, isPositive: $isPositive, comment: $comment) {
        reviewId
        error { code message }
      }
    }
  }
`

export const LEAVE_COMPLAINT = gql`
  mutation LeaveComplaint($targetUserId: ID!, $reason: String!) {
    user {
      leaveComplaint(targetUserId: $targetUserId, reason: $reason) {
        complaintId
        error { code message }
      }
    }
  }
`

export const RESIGN_AS_EXECUTOR = gql`
  mutation ResignAsExecutor($helpRequestId: ID!, $reason: String!) {
    helpRequest {
      resignAsExecutor(helpRequestId: $helpRequestId, reason: $reason) {
        success
        error { code message }
      }
    }
  }
`

export const REMOVE_EXECUTOR = gql`
  mutation RemoveExecutor($helpRequestId: ID!, $reason: String!) {
    helpRequest {
      removeExecutor(helpRequestId: $helpRequestId, reason: $reason) {
        success
        error { code message }
      }
    }
  }
`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($phoneNumber: String, $socialLinks: String) {
    user {
      updateProfile(phoneNumber: $phoneNumber, socialLinks: $socialLinks) {
        success
        error { code message }
      }
    }
  }
`
// ========================
// Admin module queries
// ========================

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    user {
      verifyEmail(token: $token) {
        success
        error { code message }
      }
    }
  }
`

export const SEND_VERIFICATION_EMAIL = gql`
  mutation SendVerificationEmail {
    user {
      sendVerificationEmail {
        success
        error { code message }
      }
    }
  }
`

export const SUBMIT_VOLUNTEER_APPLICATION = gql`
  mutation SubmitVolunteerApplication(
    $organizationName: String!
    $activityDescription: String!
    $documentImageUrl: String
  ) {
    user {
      submitVolunteerApplication(
        organizationName: $organizationName
        activityDescription: $activityDescription
        documentImageUrl: $documentImageUrl
      ) {
        applicationId
        error { code message }
      }
    }
  }
`

export const GET_PUBLIC_PROFILE = gql`
  query GetPublicProfile($userId: ID!) {
    userQuery {
      getPublicProfile(userId: $userId) {
        profile {
          id
          username
          role
          registeredAtUtc
          isEmailVerified
          hasPhone
          hasSocialLinks
          positiveReviews
          negativeReviews
          totalRequests
          completedRequests
          helpedRequests
          rejectedRequests
          phoneNumber
          socialLinks
          lastActivityAtUtc
        }
        error { code message }
      }
    }
  }
`

export const GET_USER_REVIEWS_PUBLIC = gql`
  query GetUserReviewsPublic($targetUserId: ID!) {
    userQuery {
      getUserReviews(targetUserId: $targetUserId) {
        reviews {
          id
          reviewerUsername
          isPositive
          comment
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`

export const GET_ADMIN_HELP_REQUESTS = gql`
  query GetAdminHelpRequests($filter: AdminHelpRequestFilterInput) {
    adminQuery {
      helpRequests(filter: $filter) {
        items {
          id
          title
          status
          isHidden
          isDeleted
          creatorUsername
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`

export const GET_COMPLAINTS = gql`
  query GetComplaints($isResolved: Boolean) {
    adminQuery {
      complaints(isResolved: $isResolved) {
        items {
          id
          reporterUserId
          reporterUsername
          targetUserId
          targetUsername
          reason
          isResolved
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`

export const GET_VOLUNTEER_APPLICATIONS = gql`
  query GetVolunteerApplications($status: Int) {
    adminQuery {
      volunteerApplications(status: $status) {
        items {
          id
          userId
          username
          organizationName
          activityDescription
          documentImageUrl
          status
          adminComment
          submittedAtUtc
          reviewedAtUtc
        }
        error { code message }
      }
    }
  }
`

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers($page: Int!, $pageSize: Int!, $searchTerm: String, $shortId: String) {
    adminQuery {
      users(page: $page, pageSize: $pageSize, searchTerm: $searchTerm, shortId: $shortId) {
        items {
          id
          username
          email
          role
          registeredAtUtc
          isBlocked
          blockedUntilUtc
          isDeleted
          lastActivityAtUtc
        }
        error { code message }
      }
    }
  }
`;

export const GET_BLOCK_HISTORY = gql`
  query GetBlockHistory($userId: ID!) {
    adminQuery {
      blockHistory(userId: $userId) {
        items {
          id
          adminUsername
          reason
          blockedUntilUtc
          createdAtUtc
        }
        error { code message }
      }
    }
  }
`

export const BLOCK_USER = gql`
  mutation BlockUser($targetUserId: ID!, $reason: String!, $blockedUntilUtc: DateTime) {
    admin {
      blockUser(targetUserId: $targetUserId, reason: $reason, blockedUntilUtc: $blockedUntilUtc) {
        success
        error { code message }
      }
    }
  }
`

export const UNBLOCK_USER = gql`
  mutation UnblockUser($targetUserId: ID!) {
    admin {
      unblockUser(targetUserId: $targetUserId) {
        success
        error { code message }
      }
    }
  }
`

export const HIDE_HELP_REQUEST = gql`
  mutation HideHelpRequest($helpRequestId: ID!, $hide: Boolean!) {
    admin {
      hideHelpRequest(helpRequestId: $helpRequestId, hide: $hide) {
        success
        error { code message }
      }
    }
  }
`

export const RESOLVE_COMPLAINT = gql`
  mutation ResolveComplaint($complaintId: ID!, $adminComment: String) {
    admin {
      resolveComplaint(complaintId: $complaintId, adminComment: $adminComment) {
        success
        error { code message }
      }
    }
  }
`

export const REVIEW_VOLUNTEER_APPLICATION = gql`
  mutation ReviewVolunteerApplication($applicationId: ID!, $approve: Boolean!, $comment: String) {
    admin {
      reviewVolunteerApplication(
        applicationId: $applicationId
        approve: $approve
        comment: $comment
      ) {
        success
        error { code message }
      }
    }
  }
`

export const RESEND_VERIFICATION_EMAIL = gql`
  mutation ResendVerificationEmail($email: String!) {
    user {
      resendVerificationEmail(email: $email) {
        success
        error { code message }
      }
    }
  }
`

export const GET_MY_VOLUNTEER_APPLICATION = gql`
  query GetMyVolunteerApplication {
    userQuery {
      getMyVolunteerApplication {
        application {
          id
          status
          adminComment
          submittedAtUtc
        }
        error { code message }
      }
    }
  }
`

// ========================
// Statistics queries
// ========================

export const GET_PLATFORM_STATS = gql`
  query GetPlatformStats {
    statsQuery {
      platformStats {
        stats {
          totalRequests
          moderationRequests
          openRequests
          inProgressRequests
          resolvedRequests
          cancelledRequests
          rejectedRequests
          totalUsers
          totalVolunteers
          completionRate
          avgCompletionDays
        }
        error { code message }
      }
    }
  }
`

export const GET_MONTHLY_ACTIVITY = gql`
  query GetMonthlyActivity {
    statsQuery {
      monthlyActivity {
        items { year month count }
        error { code message }
      }
    }
  }
`

export const GET_TOP_VOLUNTEERS = gql`
  query GetTopVolunteers($limit: Int) {
    statsQuery {
      topVolunteers(limit: $limit) {
        data {
          byCompleted { userId username completedCount }
          byReviews { userId username positiveReviews }
        }
        error { code message }
      }
    }
  }
`

export const GET_ADMIN_ANALYTICS = gql`
  query GetAdminAnalytics {
    statsQuery {
      adminAnalytics {
        data {
          newRequestsThisWeek
          newRequestsLastWeek
          newUsersThisWeek
          pendingComplaints
          totalComplaints
          blockedUsers
          totalUsers
          totalVolunteers
          totalAdmins
        }
        error { code message }
      }
    }
  }
`

export const CANCEL_RESPONSE = gql`
  mutation CancelResponse($helpRequestId: ID!) {
    helpRequest {
      cancelResponse(helpRequestId: $helpRequestId) {
        success
        error { code message }
      }
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($limit: Int) {
    notificationQuery {
      notifications(limit: $limit) {
        data {
          id
          title
          content
          type
          isRead
          createdAtUtc
          relatedEntityId
          relatedEntityType
        }
        error {
          code
          message
        }
      }
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkAsRead($id: ID!) {
    notification {
      markAsRead(id: $id) {
        success
        error {
          code
          message
        }
      }
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllAsRead {
    notification {
      markAllAsRead {
        success
        error {
          code
          message
        }
      }
    }
  }
`;

export const APPROVE_HELP_REQUEST = gql`
  mutation ApproveHelpRequest($helpRequestId: ID!) {
    admin {
      approveHelpRequest(helpRequestId: $helpRequestId) {
        success
        error { code message }
      }
    }
  }
`;

export const REJECT_HELP_REQUEST = gql`
  mutation RejectHelpRequest($helpRequestId: ID!, $reason: String!) {
    admin {
      rejectHelpRequest(helpRequestId: $helpRequestId, reason: $reason) {
        success
        error { code message }
      }
    }
  }
`;
