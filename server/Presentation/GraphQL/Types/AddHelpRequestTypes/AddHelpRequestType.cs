using GraphQL.Types;
using server.Application.Handlers.AddHelpRequest;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.AddHelpRequestTypes
{
    public class AddHelpRequestType : ObjectGraphType<AddHelpRequestResult>
    {
        public AddHelpRequestType()
        {
            Field<IdGraphType>("id")
                .Resolve(ctx => ctx.Source?.Id)
                .Description("The ID of the created request.");

            Field<StringGraphType>("title")
                .Resolve(ctx => ctx.Source?.Title);

            Field<StringGraphType>("description")
                .Resolve(ctx => ctx.Source?.Description);
            
            Field<GuidGraphType>("creatorId")
                .Resolve(ctx => ctx.Source?.CreatorId);
            
            Field<DateTimeGraphType>("createdAtUtc")
                .Resolve(ctx => ctx.Source?.CreatedAtUtc);

            Field<FloatGraphType>("latitude")
                .Resolve(ctx => ctx.Source?.Latitude);

            Field<FloatGraphType>("longitude")
                .Resolve(ctx => ctx.Source?.Longitude);

            Field<ListGraphType<StringGraphType>>("imageUrls")
                .Resolve(ctx => ctx.Source?.ImageUrls);

            Field<StringGraphType>("status")
                 .Resolve(ctx => ctx.Source?.Status.ToString());
        }
    }
}
