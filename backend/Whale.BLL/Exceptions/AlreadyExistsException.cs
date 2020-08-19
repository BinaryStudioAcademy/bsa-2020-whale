using System;

namespace Whale.BLL.Exceptions
{
    public sealed class AlreadyExistsException : BaseCustomException
    {
        public AlreadyExistsException(string name, string id)
            : base($"{name} with {id} is already exist.")
        {
            _httpError = 400;
        }
        public AlreadyExistsException(string name)
            : base($"{name} is already exist.")
        {
            _httpError = 400;
        }

        public AlreadyExistsException() : base()
        {
        }

        public AlreadyExistsException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
