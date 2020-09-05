namespace Whale.Shared.Exceptions
{
    public sealed class ExpiredRefreshTokenException : BaseCustomException
    {
        public ExpiredRefreshTokenException(string message, System.Exception innerException) : base(message, innerException)
        {
        }

        public ExpiredRefreshTokenException(string message) : base(message)
        {
        }

        public ExpiredRefreshTokenException() : base("Refresh token expired.") { }
    }
}
