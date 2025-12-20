using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.RegisterUser;
using server.Presentation.GraphQL;

namespace server.Presentation
{
    public class AuthMutation : ObjectGraphType
    {
        public AuthMutation(IMediator mediator)
        {
            Field<IdGraphType>("register")
                .Arguments(new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "username" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "email" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "password" }
                ))
                .ResolveAsync (async context =>
                {
                    var start = DateTime.UtcNow;
                    const int MIN_DELAY_MS = 1500;

                    var username = context.GetArgument<string>("username");
                    var email = context.GetArgument<string>("email");
                    var password = context.GetArgument<string>("password");

                    var token = await mediator.Send(
                    new RegisterUserCommand(username, email, password)
                );

                    if (context.UserContext is GraphQLUserContext userContext && userContext.HttpContext != null)
                    {
                        userContext.HttpContext.Response.Cookies.Append("jwt", token, new CookieOptions
                        {
                            HttpOnly = true,
                            Secure = true,
                            SameSite = SameSiteMode.None,
                            Expires = DateTimeOffset.UtcNow.AddHours(10)
                        });

                    }


                    // PLACE A MINIMUM DELAY TO MITIGATE BRUTE-FORCE ATTACKS
                    return token;
                });
        }
    }
}
