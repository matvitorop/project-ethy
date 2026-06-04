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
                    string blockCacheKey = $"user_blocked_{userId}";
                    if (!cache.TryGetValue(blockCacheKey, out bool isBlocked))
                    {
                        var user = await userRepository.GetByIdAsync(userId, context.RequestAborted);
                        isBlocked = user?.IsBlocked ?? false;
                        cache.Set(blockCacheKey, isBlocked, TimeSpan.FromMinutes(5));
                    }

                    if (isBlocked)
                    {
                        context.Response.StatusCode = 401;
                        await context.Response.WriteAsync("User is blocked");
                        return;
                    }

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
