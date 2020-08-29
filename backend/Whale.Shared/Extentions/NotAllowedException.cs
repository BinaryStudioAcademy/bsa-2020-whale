namespace Whale.Shared.Exceptions
{
    public class NotAllowedException : BaseCustomException
    {
        public NotAllowedException(string email) : base($"User with email \"{email}\" has no permission for the action.")
        {
            _httpError = 403;
        }
    }
}