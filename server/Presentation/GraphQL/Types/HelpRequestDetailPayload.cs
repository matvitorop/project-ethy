using server.Application.Handlers.GetFullHelpRequest;

namespace server.Presentation.GraphQL.Types
{
    public class HelpRequestDetailPayload 
    {
        public bool IsSuccess { get; }
        public HelpRequestDetailDto? Item { get; }
        public string? ErrorCode { get; }
        public string? ErrorMessage { get; }

        public HelpRequestDetailPayload(
            bool isSuccess,
            HelpRequestDetailDto? item,
            string? errorCode,
            string? errorMessage)
        {
            IsSuccess = isSuccess;
            Item = item;
            ErrorCode = errorCode;
            ErrorMessage = errorMessage;
        }
    }
}
