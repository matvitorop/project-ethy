using GraphQL.Types;

namespace server.Presentation.Schemas
{
    public class AppSchema : Schema
    {
        public AppSchema(IServiceProvider provider) : base(provider)
        {
            Mutation = provider.GetRequiredService<AuthMutation>();
            Query = provider.GetRequiredService<AppQuery>();
        }
    }
}
