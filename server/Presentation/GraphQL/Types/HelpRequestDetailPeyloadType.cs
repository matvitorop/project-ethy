using GraphQL.Types;

namespace server.Presentation.GraphQL.Types
{
    public class HelpRequestDetailPeyloadType : ObjectGraphType<HelpRequestDetailPayload>
    {
        public HelpRequestDetailPeyloadType()
        {
            Field<HelpRequestDetailType>("item")
                .Resolve(context => context.Source.Item);

            Field<ErrorPayloadType>("error")
                .Resolve(context => context.Source.Error);
        }
    }
}
