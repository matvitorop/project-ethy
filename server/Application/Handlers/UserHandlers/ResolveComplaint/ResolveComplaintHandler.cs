using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Notifications;
using server.Domain.Primitives;

namespace server.Application.Handlers.UserHandlers.ResolveComplaint
{
    public class ResolveComplaintHandler
        : IRequestHandler<ResolveComplaintCommand, Result<bool>>
    {
        private readonly IComplaintRepository _complaints;
        private readonly INotificationService _notifications;

        public ResolveComplaintHandler(
            IComplaintRepository complaints, 
            INotificationService notifications)
        {
            _complaints = complaints;
            _notifications = notifications;
        }

        public async Task<Result<bool>> Handle(
            ResolveComplaintCommand request, CancellationToken ct)
        {
            var complaint = await _complaints.GetByIdAsync(request.ComplaintId, ct);
            if (complaint is null)
                return Result<bool>.Failure(new Error("Complaint not found", "Complaint.NOT_FOUND"));

            var ok = await _complaints.MarkAsResolvedAsync(
                request.ComplaintId, request.AdminComment, ct);

            if (ok)
            {
                // Повідомляємо автора скарги про результат
                string title = "Розгляд скарги";
                string content = string.IsNullOrWhiteSpace(request.AdminComment)
                    ? "Вашу скаргу було розглянуто адміністратором."
                    : $"Вашу скаргу було розглянуто: {request.AdminComment}";

                await _notifications.SendNotificationAsync(
                    complaint.ReporterUserId,
                    title,
                    content,
                    NotificationType.Info,
                    null, // Можливо, варто додати ID скарги як метадані, але на фронті поки немає сторінки для них
                    null,
                    ct);
            }

            return ok
                ? Result<bool>.Success(true)
                : Result<bool>.Failure(new Error("Failed to mark as resolved", "Complaint.UPDATE_FAILED"));
        }
    }
}
