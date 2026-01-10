using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.LoginUser
{
    public record LoginUserCommand(string Email, string Password) : IRequest<Result<string>>;

}
