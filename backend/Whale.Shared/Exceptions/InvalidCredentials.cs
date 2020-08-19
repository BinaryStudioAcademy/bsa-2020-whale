namespace Whale.Shared.Exceptions
{
    public sealed class InvalidCredentials: BaseCustomException
    {
        public InvalidCredentials() : base("Invalid credentials") { }
    }
}
