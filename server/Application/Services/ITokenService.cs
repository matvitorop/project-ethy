using server.Domain;

namespace server.Application.Services
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
