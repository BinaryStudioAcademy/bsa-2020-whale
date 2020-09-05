namespace Whale.Shared.Exceptions
{
    public sealed class InvalidCredentialsExseption : BaseCustomException
    {
        public InvalidCredentialsExseption(string message, System.Exception innerException) : base(message, innerException)
        {
        }

        public InvalidCredentialsExseption(string message) : base(message)
        {
        }

        public InvalidCredentialsExseption() : base("Invalid credentials") { }
    }
}
