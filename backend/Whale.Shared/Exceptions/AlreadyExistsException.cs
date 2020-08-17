using System;

namespace Whale.Shared.Exceptions
{
    public sealed class AlreadyExistsException : BaseCustomException
    {
        public AlreadyExistsException(string name, string id)
            : base($"{name} with {id} is already exist.")
        { }
        public AlreadyExistsException(string name)
            : base($"{name} is already exist.")
        { }

        public AlreadyExistsException() : base()
        {
        }

        public AlreadyExistsException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
