namespace server.Application.Handlers.AssignExecutor
{
    public sealed record AssignExecutorResult(
        Guid HelpRequestId,
        Guid AssignedUserId
    );
}
