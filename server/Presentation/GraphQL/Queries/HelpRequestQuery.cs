using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.GetActiveRequests;
using server.Presentation.GraphQL.Types;

namespace server.Presentation.GraphQL.Queries
{
    public class HelpRequestQuery : ObjectGraphType
    {
        public HelpRequestQuery(IMediator mediator)
        {
            Field<HelpRequestsPagePayloadType>("helpRequestQuery")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IntGraphType>> { Name = "page" },
                new QueryArgument<NonNullGraphType<IntGraphType>> { Name = "pageSize" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetHelpRequestsPageQuery(
                        context.GetArgument<int>("page"),
                        context.GetArgument<int>("pageSize")
                    ));

                if (!result.IsSuccess)
                {
                    return new HelpRequestsPagePayload(
                        false,
                        null,
                        result.Error.Code,
                        result.Error.Message
                    );
                }

                return new HelpRequestsPagePayload(
                    true,
                    result.Value,
                    null,
                    null
                );
            });
        }
    }
}
