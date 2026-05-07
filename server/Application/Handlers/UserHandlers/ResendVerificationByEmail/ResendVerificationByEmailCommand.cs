using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.ResendVerificationByEmail
{
    public record ResendVerificationByEmailCommand(string Email) : IRequest<Result<bool>>;

}
