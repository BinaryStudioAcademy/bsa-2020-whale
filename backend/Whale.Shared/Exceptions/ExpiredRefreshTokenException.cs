namespace Whale.Shared.Exceptions
{

    public sealed class ExpiredRefreshTokenException : BaseCustomException
    {
        public ExpiredRefreshTokenException() : base("Refresh token expired.") { }
    }
}
