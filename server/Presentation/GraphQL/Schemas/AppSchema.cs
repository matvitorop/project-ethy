using GraphQL.Types;
using server.Presentation.GraphQL.Mutations;
using server.Presentation.GraphQL.Schemas;

namespace server.Presentation.Schemas
{
    public class AppSchema : Schema
    {
        public AppSchema(IServiceProvider provider) : base(provider)
        {
            Mutation = provider.GetRequiredService<AppMutation>();
            Query = provider.GetRequiredService<AppQuery>();
        }
    }
}
