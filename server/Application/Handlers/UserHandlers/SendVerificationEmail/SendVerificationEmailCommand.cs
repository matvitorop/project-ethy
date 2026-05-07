using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.SendVerificationEmail
{
    public record SendVerificationEmailCommand(Guid UserId) : IRequest<Result<bool>>;
}
