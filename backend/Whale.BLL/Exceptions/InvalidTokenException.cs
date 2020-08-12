namespace Whale.BLL.Exceptions
{
    public sealed class InvalidTokenException : BaseCustomException
    {
        public InvalidTokenException(string tokenName) : base($"Invalid {tokenName} token.") { }
    }
}
