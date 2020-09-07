namespace Whale.Shared.Exceptions
{
    public class NotAllowedException : BaseCustomException
    {
        public NotAllowedException()
        {
        }

        public NotAllowedException(string email) : base($"User with email \"{email}\" has no permission for the action.")
        {
            _httpError = 403;
        }

        public NotAllowedException(string message, System.Exception innerException) : base(message, innerException)
        {
        }
    }
}