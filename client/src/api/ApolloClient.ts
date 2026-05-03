import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
} from '@apollo/client'

const httpLink = new HttpLink({
    uri: 'https://localhost:7246/graphql',
    credentials: 'include',
})

export const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'cache-first',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
})