namespace Whale.Shared.Exceptions
{
    public sealed class InvalidCredentialsExseption : BaseCustomException
    {
        public InvalidCredentialsExseption() : base("Invalid credentials") { }
    }
}
