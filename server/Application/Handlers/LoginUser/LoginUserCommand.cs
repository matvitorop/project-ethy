using MediatR;

namespace server.Application.Handlers.LoginUser
{
    public record LoginUserCommand(string Email, string Password) : IRequest<LoginUserResult>;

}
