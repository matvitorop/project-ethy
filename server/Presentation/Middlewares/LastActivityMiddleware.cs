using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;
using server.Application.IRepositories;

namespace server.Presentation.Middlewares
{
    public class LastActivityMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly TimeSpan UpdateInterval = TimeSpan.FromMinutes(5);

        public LastActivityMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUserRepository userRepository, IMemoryCache cache)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    string cacheKey = $"last_activity_{userId}";
                    
                    if (!cache.TryGetValue(cacheKey, out DateTime lastUpdate) || (DateTime.UtcNow - lastUpdate) > UpdateInterval)
                    {
                        await userRepository.UpdateLastActivityAsync(userId, context.RequestAborted);
                        cache.Set(cacheKey, DateTime.UtcNow, UpdateInterval);
                    }
                }
            }

            await _next(context);
        }
    }
}
