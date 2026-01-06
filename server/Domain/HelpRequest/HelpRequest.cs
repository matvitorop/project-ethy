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

        public Guid Id { get; private set; }
        public string Title { get; private set; }
        public string Description { get; private set; }

        public HelpRequestStatus Status { get; private set; }

        public Guid CreatorId { get; private set; }

        public HelpRequestGeoPoint? Location { get; private set; }

        public DateTime CreatedAtUtc { get; private set; }

        public IReadOnlyCollection<RequestImage> Images => _images.AsReadOnly();

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

        private void SetTitle(string title)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("TITLE_REQUIRED");

            if (title.Length > 200)
                throw new ArgumentOutOfRangeException("TITLE_TOO_LONG");

            Title = title;
        }

        private void SetDescription(string description)
        {
            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("DESCRIPTION_REQUIRED");

            if (description.Length > 4000)
                throw new ArgumentOutOfRangeException("DESCRIPTION_TOO_LONG");

            Description = description;
        }

        public void AddImage(string url)
        {
            if (Status != HelpRequestStatus.Open)
                throw new ArgumentException("CANNOT_ADD_IMAGE_IN_CURRENT_STATUS");

            if (_images.Count >= 5)
                throw new ArgumentOutOfRangeException("IMAGE_LIMIT_EXCEEDED");

            _images.Add(new RequestImage(_images.Count, url));
        }

        public void RemoveImage(int order)
        {
            var image = _images.FirstOrDefault(i => i.Order == order);
            if (image == null)
                throw new ArgumentException("IMAGE_NOT_FOUND");

            _images.Remove(image);

            for (int i = 0; i < _images.Count; i++)
                _images[i] = new RequestImage(i, _images[i].ImageUrl);
        }

        public void MarkInProgress()
        {
            if (Status != HelpRequestStatus.Open)
                throw new ArgumentException("INVALID_STATUS_TRANSITION");

            Status = HelpRequestStatus.InProgress;
        }

        public void Complete()
        {
            if (Status != HelpRequestStatus.InProgress)
                throw new ArgumentException("INVALID_STATUS_TRANSITION");

            Status = HelpRequestStatus.Resolved;
        }

        public void Cancel()
        {
            if (Status is HelpRequestStatus.Resolved or HelpRequestStatus.Cancelled)
                throw new ArgumentException("INVALID_STATUS_TRANSITION");

            Status = HelpRequestStatus.Cancelled;
        }
    }
}
}
