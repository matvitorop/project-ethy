using server.Domain.Primitives;
using server.Presentation.GraphQL.Types.ErrorTypes;

namespace server.Presentation.GraphQL.Extensions
{
    public static class ResultExtension
    {
        public static TPayload ToPayload<TValue, TPayload>(
            this Result<TValue> result,
            Func<TValue?, ErrorPayload, TPayload> factory
        )
        {
            return result.IsSuccess
            ? factory(result.Value, null)
            : factory(default, new ErrorPayload(
                result.Error.Code,
                result.Error.Message));
        }

        public static TPayload ToPayload<TPayload>(
        this Result result,
        Func<ErrorPayload?, TPayload> factory)
        {
            return result.IsSuccess
                ? factory(null)
                : factory(new ErrorPayload(
                    result.Error.Code,
                    result.Error.Message));
        }

    }
}