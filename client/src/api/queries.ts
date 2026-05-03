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
    user {
      profile {
        profile { id username email registeredAtUtc }
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
  query GetHelpRequests($page: Int!, $pageSize: Int!) {
    helpRequestQuer {
      helpRequestQuery(page: $page, pageSize: $pageSize) {
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