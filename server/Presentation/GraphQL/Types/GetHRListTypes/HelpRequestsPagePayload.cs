using server.Application.Handlers.GetActiveRequests;

namespace server.Presentation.GraphQL.Types.GetHRListTypes
{
    public class HelpRequestsPagePayload
    {
        public bool IsSuccess { get; }
        public IReadOnlyList<HelpRequestListItemDto>? Items { get; }
        public string? ErrorCode { get; }
        public string? ErrorMessage { get; }

        public HelpRequestsPagePayload(
            bool isSuccess,
            IReadOnlyList<HelpRequestListItemDto>? items,
            string? errorCode,
            string? errorMessage)
        {
            IsSuccess = isSuccess;
            Items = items;
            ErrorCode = errorCode;
            ErrorMessage = errorMessage;
        }
    }
}
