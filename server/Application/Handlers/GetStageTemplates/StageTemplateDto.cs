namespace server.Application.Handlers.GetStageTemplates
{
    public sealed record StageTemplateDto(
        Guid Id,
        string Content,
        bool IsAutomatic
    );
}
