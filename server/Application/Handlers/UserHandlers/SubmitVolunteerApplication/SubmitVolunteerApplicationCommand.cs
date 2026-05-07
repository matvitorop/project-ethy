using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.SubmitVolunteerApplication
{
    public record SubmitVolunteerApplicationCommand(
        Guid UserId,
        string OrganizationName,
        string ActivityDescription,
        string? DocumentImageUrl
    ) : IRequest<Result<Guid>>;

}
