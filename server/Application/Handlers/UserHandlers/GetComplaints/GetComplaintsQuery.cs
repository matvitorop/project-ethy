using MediatR;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.GetComplaints
{
    public record GetComplaintsQuery(bool? IsResolved) : IRequest<Result<List<AdminComplaintDto>>>;
}
