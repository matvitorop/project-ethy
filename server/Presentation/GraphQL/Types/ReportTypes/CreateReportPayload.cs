using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.ReportTypes
{
    public sealed record CreateReportPayload(
        Guid? ReportId,
        ErrorPayload? Error
    );
}
