using System;

namespace Whale.BLL.Exceptions
{
    public class BaseCustomException : Exception
    {
        public bool _isLogged = false; //If true - exception will be written to log
        public int _httpError = 400;

        public BaseCustomException(bool isLogged = false) : base()
        {
            _isLogged = isLogged;
        }

        public BaseCustomException(string message, Exception innerException, bool isLogged = false) : base(message, innerException)
        {
            _isLogged = isLogged;
        }

        public BaseCustomException(string message, bool isLogged = false) : base(message)
        {
            _isLogged = isLogged;
        }
    }
}
