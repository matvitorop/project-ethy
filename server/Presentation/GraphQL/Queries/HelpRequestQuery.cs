using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.GetActiveRequests;
using server.Application.Handlers.GetFullHelpRequest;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;
using server.Presentation.GraphQL.Types.GetHRDetailTypes;
using server.Presentation.GraphQL.Types.GetHRListTypes;

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


                return result.ToPayload((value, error) => new HelpRequestsPagePayload(value, error));
            });

            Field<HelpRequestDetailPeyloadType>("helpRequestById")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>> { Name = "id" }
            )
            .ResolveAsync(async context =>
            {
                var result = await mediator.Send(
                    new GetFullHelpRequestQuery(
                        context.GetArgument<Guid>("id")
                    )
                );

                return result.ToPayload((value, error) => new HelpRequestDetailPayload(value, error));
            });
        }
    }
}
