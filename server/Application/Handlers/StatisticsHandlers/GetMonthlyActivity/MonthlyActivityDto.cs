namespace server.Application.Handlers.StatisticsHandlers.GetMonthlyActivity
{
    public record MonthlyActivityDto(
        int Year,
        int Month,
        int Count
    );
}
