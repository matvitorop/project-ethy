using MediatR;

namespace server.Application.Handlers.RegisterUser
{
    public record RegisterUserCommand(string Username, string Email, string Password) : IRequest<RegisterUserResult>;
}
