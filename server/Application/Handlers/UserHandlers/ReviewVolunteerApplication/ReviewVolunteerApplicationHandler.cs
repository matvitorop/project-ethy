using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain;
using server.Domain.Primitives;
using server.Domain.UserAndVolunteer;

namespace server.Application.Handlers.UserHandlers.ReviewVolunteerApplication
{
    public class ReviewVolunteerApplicationHandler
        : IRequestHandler<ReviewVolunteerApplicationCommand, Result<bool>>
    {
        private readonly IVolunteerApplicationRepository _applications;
        private readonly IUserRepository _users;
        private readonly IEmailSender _emailSender;

        public ReviewVolunteerApplicationHandler(
            IVolunteerApplicationRepository applications,
            IUserRepository users,
            IEmailSender emailSender)
        {
            _applications = applications;
            _users = users;
            _emailSender = emailSender;
        }

        public async Task<Result<bool>> Handle(
            ReviewVolunteerApplicationCommand request,
            CancellationToken ct)
        {
            var application = await _applications.GetByIdAsync(request.ApplicationId, ct);
            if (application is null)
                return Result<bool>.Failure(new Error(
                    "Application not found",
                    "Volunteer.NOT_FOUND"));

            if (application.Status != VolunteerApplicationStatus.Pending)
                return Result<bool>.Failure(new Error(
                    "Application is already reviewed",
                    "Volunteer.ALREADY_REVIEWED"));

            var user = await _users.GetByIdAsync(application.UserId, ct);
            if (user is null)
                return Result<bool>.Failure(new Error("User not found", "User.NOT_FOUND"));

            if (request.Approve)
            {
                application.Approve(request.AdminId, request.Comment);
                user.PromoteToVolunteer();
                await _users.UpdateRoleAsync(user.Id, UserRole.Volunteer, ct);
            }
            else
            {
                application.Reject(request.AdminId, request.Comment);
            }

            await _applications.UpdateAsync(application, ct);

            // Надсилаємо email
            try
            {
                await _emailSender.SendVolunteerApplicationResultAsync(
                    user.Email, user.Username, request.Approve, request.Comment);
            }
            catch
            {
                // Email failure не блокує операцію
            }

            return Result<bool>.Success(true);
        }
    }
}
