using server.Domain.Exceptions;
using static System.Net.Mime.MediaTypeNames;

namespace server.Domain.HelpRequest
{
    public enum HelpRequestStatus
    {
        Draft = 0,
        Open = 1,
        InProgress = 2,
        Resolved = 3,
        Cancelled = 4
    }

    public class HelpRequest
    {
        private readonly List<RequestImage> _images = new();

        private readonly List<HelpRequestResponse> _responses = new();
        public IReadOnlyCollection<HelpRequestResponse> Responses => _responses.AsReadOnly();
        public Guid? AssignedUserId { get; private set; }

        public Guid Id { get; private set; }
        public string Title { get; private set; }
        public string Description { get; private set; }

        public HelpRequestStatus Status { get; private set; }

        public Guid CreatorId { get; private set; }

        public HelpRequestGeoPoint? Location { get; private set; }

        public DateTime CreatedAtUtc { get; private set; }

        public IReadOnlyCollection<RequestImage> Images => _images.AsReadOnly();

        public DateTime? UpdatedAtUtc { get; private set; }

        public bool IsDeleted { get; private set; }
        public string? CancellationReason { get; private set; }

        private HelpRequest() { }

        public HelpRequest(
            Guid creatorId,
            string title,
            string description,
            HelpRequestGeoPoint? location = null)
        {
            Id = Guid.NewGuid();
            CreatorId = creatorId;

            SetTitle(title);
            SetDescription(description);

            Location = location;

            Status = HelpRequestStatus.Open;
            CreatedAtUtc = DateTime.UtcNow;
        }
        internal HelpRequest(
            Guid id,
            Guid creatorId,
            string title,
            string description,
            int status,
            Guid? assignedUserId,
            double? latitude,
            double? longitude,
            DateTime createdAtUtc,
            DateTime? updatedAtUtc,
            bool isDeleted,
            string? cancellationReason,
            IEnumerable<HelpRequestResponse> responses)
        {
            Id = id;
            CreatorId = creatorId;
            Title = title;
            Description = description;
            Status = (HelpRequestStatus)status;
            AssignedUserId = assignedUserId;
            CreatedAtUtc = createdAtUtc;
            UpdatedAtUtc = updatedAtUtc;
            IsDeleted = isDeleted;
            CancellationReason = cancellationReason;

            if (latitude.HasValue && longitude.HasValue)
                Location = new HelpRequestGeoPoint(latitude.Value, longitude.Value);

            _responses.AddRange(responses);
        }
        private void SetTitle(string title)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new DomainException("Title is empty","HelpRequest.TITLE_REQUIRED");

            if (title.Length > 200)
                throw new DomainException("Title is too long", "HelpRequest.TITLE_TOO_LONG");

            Title = title;
        }

        private void SetDescription(string description)
        {
            if (string.IsNullOrWhiteSpace(description))
                throw new DomainException("Description is empty", "HelpRequest.DESCRIPTION_REQUIRED");

            if (description.Length > 4000)
                throw new DomainException("Title is too long", "HelpRequest.DESCRIPTION_TOO_LONG");

            Description = description;
        }

        public void AddImage(string url)
        {
            if (Status != HelpRequestStatus.Open)
                throw new DomainException("Wrong help request status for adding image", "HelpRequest.CANNOT_ADD_IMAGE_IN_CURRENT_STATUS");

            if (_images.Count >= 5)
                throw new DomainException("Too many images to add", "HelpRequest.IMAGE_LIMIT_EXCEEDED");

            _images.Add(new RequestImage(_images.Count, url));
        }

        public void RemoveImage(int order)
        {
            var image = _images.FirstOrDefault(i => i.Order == order);
            if (image == null)
                throw new DomainException("Image doesnt exist or missing", "HelpRequest.IMAGE_NOT_FOUND");

            _images.Remove(image);

            for (int i = 0; i < _images.Count; i++)
                _images[i] = new RequestImage(i, _images[i].ImageUrl);
        }

        internal void MarkInProgress()
        {
            if (Status == HelpRequestStatus.Open || Status == HelpRequestStatus.Resolved)
            {
                Status = HelpRequestStatus.InProgress;
            }
            else
            {
                throw new DomainException("Wrong status for transitioning", "HelpRequest.INVALID_STATUS_TRANSITION_IN_PROGRESS");
            }
        }

        public void Complete()
        {
            if (Status != HelpRequestStatus.InProgress)
                throw new DomainException("Wrong status", "HelpRequest.INVALID_STATUS_TRANSITION_COMPLETE");

            Status = HelpRequestStatus.Resolved;
        }

        public void Cancel()
        {
            if (Status is HelpRequestStatus.Resolved or HelpRequestStatus.Cancelled)
                throw new DomainException("Wrong status", "HelpRequest.INVALID_STATUS_TRANSITION_CANCEL");

            Status = HelpRequestStatus.Cancelled;

            foreach (var r in _responses)
            {
                r.Reject();
            }
        }

        public bool HasExecutor => AssignedUserId.HasValue;
        public HelpRequestResponse AddResponse(Guid userId, string message)
        {
            if (CreatorId == userId)
                throw new DomainException("Cannot respond to own request", "HelpRequest.SELF_RESPONSE");

            if (Status != HelpRequestStatus.Open)
                throw new DomainException("Cannot respond to inactive request", "HelpRequest.NOT_OPEN");
            
            if (string.IsNullOrWhiteSpace(message))
                throw new DomainException("Message is required", "HelpRequestResponse.MESSAGE_REQUIRED");

            if (message.Length > 1000)
                throw new DomainException("Message is too long", "HelpRequestResponse.MESSAGE_TOO_LONG");

            if (_responses.Any(r => r.UserId == userId && r.Status != HelpRequestResponseStatus.Cancelled))
                throw new DomainException("User already responded", "HelpRequest.ALREADY_RESPONDED");

            var response = new HelpRequestResponse(userId, message);
            _responses.Add(response);

            return response;
        }

        public void CancelResponse(Guid userId)
        {
            var response = _responses
                .FirstOrDefault(r => r.UserId == userId);

            if (response is null)
                throw new DomainException("Response not found", "HelpRequestResponse.NOT_FOUND");

            response.Cancel();
        }

        public void AssignExecutor(Guid responseId)
        {
            if (Status != HelpRequestStatus.Open)
                throw new DomainException("Request is not open", "HelpRequest.NOT_OPEN");

            var response = _responses
                .FirstOrDefault(r => r.Id == responseId);

            if (response is null)
                throw new DomainException("Response not found", "HelpRequestResponse.NOT_FOUND");

            if (response.Status != HelpRequestResponseStatus.Pending)
                throw new DomainException("Invalid response state", "HelpRequestResponse.INVALID_STATE");

            response.Accept();

            foreach (var r in _responses.Where(r => r.Id != responseId))
            {
                r.Reject();
            }

            AssignedUserId = response.UserId;

            Status = HelpRequestStatus.InProgress;
        }

        public void Edit(
            string title,
            string description,
            double? latitude,
            double? longitude)
        {
            if (Status != HelpRequestStatus.Open)
                throw new DomainException(
                    "Cannot edit current request",
                    "HelpRequest.CANNOT_EDIT");

            SetTitle(title);
            SetDescription(description);

            Location = (latitude.HasValue && longitude.HasValue)
                ? new HelpRequestGeoPoint(latitude.Value, longitude.Value)
                : null;

            UpdatedAtUtc = DateTime.UtcNow;
        }

        public void Delete()
        {
            if (Status != HelpRequestStatus.Open)
                throw new DomainException(
                    "Cannot delete inactive request",
                    "HelpRequest.CANNOT_DELETE");

            if (IsDeleted)
                throw new DomainException(
                    "Request is already deleted",
                    "HelpRequest.ALREADY_DELETED");

            IsDeleted = true;
        }

        public void Cancel(string reason)
        {
            if (Status is HelpRequestStatus.Resolved or HelpRequestStatus.Cancelled)
                throw new DomainException(
                    "Wrong status",
                    "HelpRequest.INVALID_STATUS_TRANSITION_CANCEL");

            if (string.IsNullOrWhiteSpace(reason))
                throw new DomainException(
                    "Cancellation reason is required",
                    "HelpRequest.CANCELLATION_REASON_REQUIRED");

            if (reason.Length > 500)
                throw new DomainException(
                    "Cancellation reason is too long",
                    "HelpRequest.CANCELLATION_REASON_TOO_LONG");

            Status = HelpRequestStatus.Cancelled;
            CancellationReason = reason;
            AssignedUserId = null;

            foreach (var r in _responses)
                r.Reject();
        }

        public void Restore()
        {
            if (Status != HelpRequestStatus.Cancelled)
                throw new DomainException(
                    "Only cancelled requests can be restored",
                    "HelpRequest.CANNOT_RESTORE");

            Status = HelpRequestStatus.Open;
            CancellationReason = null;
        }
    }
}