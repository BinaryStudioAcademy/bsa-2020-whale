namespace Whale.BLL.Exceptions
{
    public sealed class InvalidCredentials: BaseCustomException
    {
        public InvalidCredentials() : base("Invalid credentials") { }
    }
}
