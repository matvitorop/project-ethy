using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.LoginUser;
using server.Application.Handlers.RegisterUser;
using server.Presentation.GraphQL.Helpers;
using server.Presentation.GraphQL.Types;

namespace server.Presentation.GraphQL.Mutations
{
    public class AuthMutation : ObjectGraphType
    {
        public AuthMutation(IMediator mediator)
        {
            Field<NonNullGraphType<RegisterPayloadType>>("register")
                .Arguments(new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "username" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "email" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "password" }
                ))
                .ResolveAsync (async context =>
                {
                    var start = DateTime.UtcNow;

                    var result = await mediator.Send(
                    new RegisterUserCommand(
                        context.GetArgument<string>("username"),
                        context.GetArgument<string>("email"),
                        context.GetArgument<string>("password")
                    )
                    );

                    if (result.Success &&
                        context.UserContext is GraphQLUserContext userContext &&
                        userContext.HttpContext != null)
                    {
                        userContext.HttpContext.Response.Cookies.Append(
                            "jwt",
                            result.Token!,
                            new CookieOptions
                            {
                                HttpOnly = true,
                                Secure = true,
                                SameSite = SameSiteMode.None,
                                Expires = DateTimeOffset.UtcNow.AddHours(5)
                            }
                        );
                    }

                    await LoginDelayHelper.EnsureMinDelay(start, 1500);
                    return result;
                });

            Field<NonNullGraphType<LoginPayloadType>>("login")
                .Arguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "email" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "password" }
                )
                .ResolveAsync(async context =>
                {
                    var start = DateTime.UtcNow;

                    var result = await mediator.Send(
                        new LoginUserCommand(
                            context.GetArgument<string>("email"),
                            context.GetArgument<string>("password")
                        )
                    );

                    if (result.Success &&
                        context.UserContext is GraphQLUserContext userContext &&
                        userContext.HttpContext != null)
                    {
                        userContext.HttpContext.Response.Cookies.Append(
                            "jwt",
                            result.Token!,
                            new CookieOptions
                            {
                                HttpOnly = true,
                                Secure = true,
                                SameSite = SameSiteMode.None,
                                Expires = DateTimeOffset.UtcNow.AddHours(5)
                            }
                        );
                    }

                    await LoginDelayHelper.EnsureMinDelay(start, 1500);

                    return result;
                });
        }
    }
}
