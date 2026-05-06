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
  ) {
    helpRequestQuer {
      helpRequestQuery(
        page: $page
        pageSize: $pageSize
        status: $status
        statuses: $statuses
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
          assignedUserId
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

export const GET_STAGES_FOR_CHAT = gql`
  query GetStagesForChat($helpRequestId: ID!) {
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
  query GetAssigneeRequests($page: Int!, $pageSize: Int!, $assignedUserId: ID) {
    helpRequestQuer {
      helpRequestQuery(page: $page, pageSize: $pageSize, assignedUserId: $assignedUserId) {
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
