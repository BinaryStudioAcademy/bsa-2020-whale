namespace Whale.BLL.Exceptions
{

    public sealed class ExpiredRefreshTokenException : BaseCustomException
    {
        public ExpiredRefreshTokenException() : base("Refresh token expired.") { }
    }
}
