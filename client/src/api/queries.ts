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