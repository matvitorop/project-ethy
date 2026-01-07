namespace server.Application.Handlers.AddHelpRequest
{
    public record AddHelpRequestResult(bool Success, 
        Guid? HelpRequestId, 
        string? ErrorCode, 
        string? ErrorMessage)
    {
        public static AddHelpRequestResult Ok(Guid id) =>
            new(true, id, null, null);

        public static AddHelpRequestResult Fail(string code, string message) =>
            new(false, null, code, message);
    }
}
