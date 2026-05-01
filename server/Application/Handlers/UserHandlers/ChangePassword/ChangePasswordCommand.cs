using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.ChangePassword
{
    public sealed record ChangePasswordCommand(
        Guid UserId,
        string OldPassword,
        string NewPassword,
        string ConfirmNewPassword
    ) : IRequest<Result>;
}
