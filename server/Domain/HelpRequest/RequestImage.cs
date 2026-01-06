namespace server.Domain.HelpRequest
{
    public class RequestImage
    {
        public int Order { get; set; }
        public string ImageUrl { get; set; }
    
        public RequestImage(int order, string imageUrl)
        {
            if (order < 0)
                throw new ArgumentOutOfRangeException(nameof(order), "Order must be non-negative.");

            if (string.IsNullOrWhiteSpace(imageUrl))
                throw new ArgumentException("ImageUrl cannot be null or empty.", nameof(imageUrl));

            Order = order;
            ImageUrl = imageUrl;
        }
    }
}
