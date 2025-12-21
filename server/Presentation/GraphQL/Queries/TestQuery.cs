using GraphQL;
using GraphQL.Types;

namespace server.Presentation.GraphQL.Queries
{
    public class TestQuery : ObjectGraphType
    {
        public TestQuery()
        {
            Field<StringGraphType>("privateHello")
            .Resolve(context => "Hello world (private)")
            .Authorize();

            Field<StringGraphType>("publicHello")
            .Resolve(context => "Hello world (public)");

            Field<StringGraphType>("adminHello")
            .Resolve(context => "Hello world (admin)")
            .Authorize()
            .AuthorizeWithRoles("Admin");

            Field<StringGraphType>("volHello")
            .Resolve(context => "Hello world (valunteer)")
            .Authorize()
            .AuthorizeWithRoles("Volunteer");
        }
    }
}
