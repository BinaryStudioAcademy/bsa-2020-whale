namespace Whale.Shared.Exceptions
{
    public sealed class InvalidTokenException : BaseCustomException
    {
        public InvalidTokenException(string tokenName) : base($"Invalid {tokenName} token.") { }

        public InvalidTokenException()
        {
        }

        public InvalidTokenException(string message, System.Exception innerException) : base(message, innerException)
        {
        }
    }
}
