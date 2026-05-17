using GraphQL.Types;

namespace server.Presentation.GraphQL.Types.AdminTypes
{
    public class AdminHelpRequestFilterInputType : InputObjectGraphType
    {
        public AdminHelpRequestFilterInputType()
        {
            Name = "AdminHelpRequestFilterInput";
            
            Field<IntGraphType>("page");
            Field<IntGraphType>("pageSize");
            Field<BooleanGraphType>("isHidden");
            Field<BooleanGraphType>("isDeleted");
            Field<ListGraphType<ChangeHRStatusTypes.HelpRequestStatusEnumType>>("statuses");
            Field<StringGraphType>("searchTerm");
        }
    }
}
