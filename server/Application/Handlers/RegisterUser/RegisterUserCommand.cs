using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.RegisterUser
{
    public record RegisterUserCommand(string Username, string Email, string Password) : IRequest<Result<string>>;
}
