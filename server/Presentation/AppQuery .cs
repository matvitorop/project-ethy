using GraphQL;
using GraphQL.Types;

namespace server.Presentation
{
    public class AppQuery : ObjectGraphType
    {
        public AppQuery()
        {
            Field<StringGraphType>("privateHello")
            .Resolve(context => "Hello world (private)")
            .Authorize();

            Field<StringGraphType>("publicHello")
            .Resolve(context => "Hello world (public)");
        }
    }
}
