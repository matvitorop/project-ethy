namespace server.Domain.Primitives
{
    public class Result<T> : Result
    {
        private readonly T? _value;

        protected internal Result(T? value, bool isSuccess, Error error)
            : base(isSuccess, error)
        {
            _value = value;
        }

        public T Value => IsSuccess
            ? _value!
            : throw new InvalidOperationException("The value of a failure result can not be accessed.");
        public static Result<T> Success(T value) => new(value, true, Error.None);
        public new static Result<T> Failure(Error error) => new(default, false, error);
    }
}
