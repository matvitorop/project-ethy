using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.LoginUser;
using server.Application.Handlers.RegisterUser;
using server.Presentation.GraphQL.Extensions;
using server.Presentation.GraphQL.Helpers;
using server.Presentation.GraphQL.Types.ErrorTypes;
using server.Presentation.GraphQL.Types.LoginTypes;
using server.Presentation.GraphQL.Types.LogoutTypes;
using server.Presentation.GraphQL.Types.RegistartionTypes;

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
                .ResolveAsync(async context =>
                {
                    var start = DateTime.UtcNow;

                    var result = await mediator.Send(
                    new RegisterUserCommand(
                        context.GetArgument<string>("username"),
                        context.GetArgument<string>("email"),
                        context.GetArgument<string>("password")
                    )
                    );

                    if (result.IsSuccess &&
                        context.UserContext is GraphQLUserContext userContext &&
                        userContext.HttpContext != null)
                    {
                        userContext.HttpContext.Response.Cookies.Append(
                            "jwt",
                            result.Value!,
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

                    return result.ToPayload(
                        (value, error) => new RegisterPayload(value, error)
                    );
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

                    if (result.IsSuccess &&
                        context.UserContext is GraphQLUserContext userContext &&
                        userContext.HttpContext != null)
                    {
                        userContext.HttpContext.Response.Cookies.Append(
                            "jwt",
                            result.Value!,
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

                    return result.ToPayload(
                        (value, error) => new LoginPayload(value, error)
                    );
                });

            Field<NonNullGraphType<LogoutPayloadType>>("logout")
                .Authorize()
                .Resolve(context =>
                {
                    if (context.UserContext is GraphQLUserContext userContext &&
                        userContext.HttpContext != null)
                    {
                        userContext.HttpContext.Response.Cookies.Delete("jwt");

                        return new LogoutPayload(
                            "Logout successful",
                            null
                        );
                    }

                    return new LogoutPayload(
                        null,
                        new ErrorPayload(
                            "Auth.LOGOUT_FAILED",
                            "Logout failed"
                        )
                    );

                });

        }
    }
}