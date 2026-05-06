using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.VerifyEmail
{
    public record VerifyEmailCommand(string Token) : IRequest<Result<bool>>;
}
