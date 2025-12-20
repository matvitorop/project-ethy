namespace server.Presentation.GraphQL.Helpers
{
    public static class LoginDelayHelper
    {
        public static async Task EnsureMinDelay(DateTime start, int minDelayMs)
        {
            var elapsed = (int)(DateTime.UtcNow - start).TotalMilliseconds;
            if (elapsed < minDelayMs)
                await Task.Delay(minDelayMs - elapsed);
        }
    }
}
