using GraphQL.Types;

namespace server.Presentation.GraphQL.Types
{
    public class HelpRequestDetailPeyloadType : ObjectGraphType<HelpRequestDetailPayload>
    {
        public HelpRequestDetailPeyloadType()
        {
            Field(x => x.IsSuccess);

            Field<HelpRequestDetailType>("item")
                .Resolve(context => context.Source.Item);

            Field(x => x.ErrorCode, nullable: true);
            Field(x => x.ErrorMessage, nullable: true);
        }
    }
}
