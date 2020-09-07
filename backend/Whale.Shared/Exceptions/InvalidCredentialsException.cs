namespace Whale.Shared.Exceptions
{
    public sealed class InvalidCredentialsException : BaseCustomException
    {
        public InvalidCredentialsException(string message, System.Exception innerException) : base(message, innerException)
        {
        }

        public InvalidCredentialsException(string message) : base(message)
        {
        }

        public InvalidCredentialsException() : base("Invalid credentials") { }
    }
}
