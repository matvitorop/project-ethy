using server.Application.Handlers.HelpRequestResponseHandlers.GetReports;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ReportTypes
{
    public sealed record ReportsPayload(
        IReadOnlyList<ReportDto>? Items,
        ErrorPayload? Error
    );
}
