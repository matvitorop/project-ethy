using MediatR;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain;
using server.Domain.Primitives;
using server.Domain.UserAndVolunteer;

namespace server.Application.Handlers.UserHandlers.SubmitVolunteerApplication
{
    public class SubmitVolunteerApplicationHandler
        : IRequestHandler<SubmitVolunteerApplicationCommand, Result<Guid>>
    {
        private readonly IUserRepository _users;
        private readonly IVolunteerApplicationRepository _applications;
        private readonly IImageStorageService _imageStorage;

        public SubmitVolunteerApplicationHandler(
            IUserRepository users,
            IVolunteerApplicationRepository applications,
            IImageStorageService imageStorage)
        {
            _users = users;
            _applications = applications;
            _imageStorage = imageStorage;
        }

        public async Task<Result<Guid>> Handle(
            SubmitVolunteerApplicationCommand request,
            CancellationToken ct)
        {
            var user = await _users.GetByIdAsync(request.UserId, ct);
            if (user is null)
                return Result<Guid>.Failure(new Error("User not found", "User.NOT_FOUND"));

            if (user.Role == UserRole.Volunteer)
                return Result<Guid>.Failure(new Error(
                    "You are already a volunteer",
                    "Volunteer.ALREADY_VOLUNTEER"));

            if (user.Role == UserRole.Admin)
                return Result<Guid>.Failure(new Error(
                    "Admins cannot apply for volunteer",
                    "Volunteer.ADMIN_CANNOT_APPLY"));

            // Перевірка 14-денного обмеження
            if (user.LastVolunteerApplicationAtUtc.HasValue &&
                user.LastVolunteerApplicationAtUtc.Value.AddDays(14) > DateTime.UtcNow)
            {
                var nextAllowed = user.LastVolunteerApplicationAtUtc.Value.AddDays(14);
                return Result<Guid>.Failure(new Error(
                    $"You can submit a new application after {nextAllowed:dd.MM.yyyy}",
                    "Volunteer.TOO_EARLY"));
            }

            // Перевірка pending заявки
            var pending = await _applications.GetPendingByUserIdAsync(request.UserId, ct);
            if (pending is not null)
                return Result<Guid>.Failure(new Error(
                    "You already have a pending application",
                    "Volunteer.PENDING_EXISTS"));

            if (string.IsNullOrWhiteSpace(request.DocumentImageUrl))
                return Result<Guid>.Failure(new Error("Document image is required", "Volunteer.DOCUMENT_REQUIRED"));

            var finalPath = await _imageStorage.MoveVolunteerDocumentFromTempAsync(
                request.DocumentImageUrl, ct);

            // Потім створюємо заявку
            var application = new VolunteerApplication(
                request.UserId,
                request.OrganizationName,
                request.ActivityDescription,
                finalPath);

            await _applications.AddAsync(application, ct);

            user.SetLastVolunteerApplicationDate();
            await _users.UpdateLastVolunteerApplicationDateAsync(request.UserId, ct);

            return Result<Guid>.Success(application.Id);
        }
    }
}
