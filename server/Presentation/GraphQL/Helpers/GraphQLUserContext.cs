using System.Security.Claims;

namespace server.Presentation.GraphQL.Helpers
{
    public class GraphQLUserContext : Dictionary<string, object>
    {
        public ClaimsPrincipal User { get; init; } = default!;
        public HttpContext? HttpContext { get; init; }
    }
}
