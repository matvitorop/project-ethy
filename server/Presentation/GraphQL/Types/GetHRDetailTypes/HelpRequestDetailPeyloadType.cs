using GraphQL.Types;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Types.GetHRDetailTypes
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
