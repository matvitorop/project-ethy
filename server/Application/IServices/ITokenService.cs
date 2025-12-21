using server.Domain;

namespace server.Application.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
    }
}
