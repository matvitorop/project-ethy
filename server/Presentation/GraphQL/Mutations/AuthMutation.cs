using GraphQL;
using GraphQL.Types;
using MediatR;
using server.Application.Handlers.LoginUser;
using server.Application.Handlers.RegisterUser;
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
                    
                    if (result.IsSuccess)
                    {
                        return new RegisterPayload(result.Value, null);
                    }
                    else
                    {
                        return new RegisterPayload(null, new ErrorPayload(result.Error.Code, result.Error.Message));
                    }
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

                    if (result.IsSuccess)
                    {
                        return new LoginPayload(result.Value, null);
                    }
                    else
                    {
                        return new LoginPayload(null, new ErrorPayload(result.Error.Code, result.Error.Message));
                    }

                });

            Field<NonNullGraphType<LogoutPayloadType>>("logout")
                .Authorize()
                .Resolve(context =>
                {
                    if (context.UserContext is GraphQLUserContext userContext &&
                        userContext.HttpContext != null)
                    {
                        userContext.HttpContext.Response.Cookies.Delete("jwt");

                        return new
                        {
                            success = true,
                            message = "Logout successful"
                        };
                    }

                    return new
                    {
                        success = false,
                        message = "Logout failed"
                    };
                });

        }
    }
}