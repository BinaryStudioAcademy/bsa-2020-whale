using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.BLL.Exceptions
{
    public sealed class InvalidTokenException : Exception
    {
        public InvalidTokenException(string tokenName) : base($"Invalid {tokenName} token.") { }
    }
}
