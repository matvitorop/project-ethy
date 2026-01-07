using GraphQL;
using server.Presentation.GraphQL.Helpers;
using System.Security.Claims;

namespace server.Presentation.GraphQL.Extensions
{
    public static class GraphQLExtensions
    {
        public static Guid GetUserId(this IResolveFieldContext context)
        {
            var userContext = context.UserContext as GraphQLUserContext;

            var claim = userContext?.User?.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
                throw new ExecutionError("UNAUTHORIZED");

            return Guid.Parse(claim.Value);
        }

        public static string GetUserEmail(this IResolveFieldContext context)
        {
            var userContext = context.UserContext as GraphQLUserContext;

            var claim = userContext?.User?.FindFirst(ClaimTypes.Email);

            if (claim == null)
                throw new ExecutionError("EMAIL_CLAIM_MISSING");

            return claim.Value;
        }

        public static bool IsInRole(this IResolveFieldContext context, string role)
        {
            var userContext = context.UserContext as GraphQLUserContext;

            return userContext?.User?.IsInRole(role) ?? false;
        }
    }
}
