using GraphQL;
using GraphQL.Resolvers;
using GraphQL.Types;
using server.Presentation.GraphQL.Mutations;
using server.Presentation.GraphQL.Queries;

namespace server.Presentation.GraphQL.Schemas
{
    public class AppQuery : ObjectGraphType
    {
        public AppQuery(IServiceProvider provider)
        {
            AddField(new FieldType
            {
                Name = "test",
                Description = "Test queries",
                ResolvedType = provider.GetRequiredService<TestQuery>(),
                Resolver = new FuncFieldResolver<object>(_ => new object())
            });

            AddField(new FieldType
            {
                Name = "helpRequestQuer",
                Description = "Queries for help reuqets operations",
                ResolvedType = provider.GetRequiredService<HelpRequestQuery>(),
                Resolver = new FuncFieldResolver<object>(_ => new object())
            });

            AddField(new FieldType
            {
                Name = "userQuery",
                Description = "Queries for user queries operations",
                ResolvedType = provider.GetRequiredService<UserQuery>(),
                Resolver = new FuncFieldResolver<object>(_ => new object())
            });
        }
    }
}
