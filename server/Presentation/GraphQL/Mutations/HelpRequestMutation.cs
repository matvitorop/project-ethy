using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.AddHelpRequest;
using server.Application.Handlers.ChangeHelpRequestStatus;
using server.Domain.HelpRequest;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Types.AddHelpRequestTypes;
using server.Presentation.GraphQL.Types.ChangeHRStatusTypes;

namespace server.Presentation.GraphQL.Mutations
{
    public class HelpRequestMutation : ObjectGraphType
    {
        public HelpRequestMutation(IMediator mediator)
        {
            Field<AddHelpRequestPayloadType>("createHelpRequest")
            .Authorize()
            .Arguments(
                new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "title" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "description" },
                    new QueryArgument<FloatGraphType> { Name = "latitude" },
                    new QueryArgument<FloatGraphType> { Name = "longitude" },
                    new QueryArgument<ListGraphType<StringGraphType>> { Name = "imageUrls" }
                )
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var command = new AddHelpRequestCommand(
                    CreatorId: userId,
                    Title: context.GetArgument<string>("title"),
                    Description: context.GetArgument<string>("description"),
                    Latitude: context.GetArgument<double?>("latitude"),
                    Longitude: context.GetArgument<double?>("longitude"),
                    ImageUrls: context.GetArgument<List<string>>("imageUrls") ?? []
                );

                var result = await mediator.Send(command);

                if (result.IsSuccess)
                {
                    return new AddHelpRequestPayload(true, result.Value, null, null);
                }
                else
                {
                    return new AddHelpRequestPayload(false, null, result.Error.Code, result.Error.Message);
                }
            });

            Field<ChangeHelpRequestStatusPayloadType>("changeHelpRequestStatus")
            .Authorize()
            .Arguments(
                new QueryArgument<NonNullGraphType<IdGraphType>>
                {
                    Name = "helpRequestId"
                },
                new QueryArgument<NonNullGraphType<HelpRequestStatusEnumType>>
                {
                    Name = "status"
                }
            )
            .ResolveAsync(async context =>
            {
                var userId = context.GetUserId();

                var helpRequestId =
                    context.GetArgument<Guid>("helpRequestId");

                var status =
                    context.GetArgument<HelpRequestStatus>("status");

                var result = await mediator.Send(
                    new ChangeHelpRequestStatusCommand(
                        helpRequestId,
                        status,
                        userId));

                if (!result.IsSuccess)
                {
                    return new ChangeHelpRequestStatusPayload(
                        false,
                        result.Error.Code,
                        result.Error.Message);
                }

                return new ChangeHelpRequestStatusPayload(
                    true,
                    null,
                    null);
            });


        }
    }
}
