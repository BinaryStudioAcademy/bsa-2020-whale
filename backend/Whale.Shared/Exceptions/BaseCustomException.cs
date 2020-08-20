using System;

namespace Whale.Shared.Exceptions
{
    public class BaseCustomException : Exception
    {
        public int _httpError = 400;

        public BaseCustomException() : base()
        {
        }

        public BaseCustomException(string message, Exception innerException) : base(message, innerException)
        {
        }

        public BaseCustomException(string message) : base(message)
        {
        }
    }
}
