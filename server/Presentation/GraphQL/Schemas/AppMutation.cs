using GraphQL.Resolvers;
using GraphQL.Types;
using server.Presentation.GraphQL.Mutations;

namespace server.Presentation.GraphQL.Schemas
{
    public class AppMutation : ObjectGraphType
    {
        public AppMutation(IServiceProvider provider)
        {
            AddField(new FieldType
            {
                Name = "auth",
                Description = "Authentication mutations",
                ResolvedType = provider.GetRequiredService<AuthMutation>(),
                Resolver = new FuncFieldResolver<object>(_ => new object())
            });

            AddField(new FieldType
            {
                Name = "helpRequest",
                Description = "Help request related mutations",
                ResolvedType = provider.GetRequiredService<HelpRequestMutation>(),
                Resolver = new FuncFieldResolver<object>(_ => new object())
            });
        }
    }
}
