using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.GetActiveRequests;
using server.Application.Handlers.GetFullHelpRequest;
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

                if (!result.IsSuccess)
                {
                    return new HelpRequestDetailPayload(
                        false,
                        null,
                        result.Error.Code,
                        result.Error.Message
                    );
                }

                return new HelpRequestDetailPayload(
                    true,
                    result.Value,
                    null,
                    null
                );
            });
        }
    }
}
