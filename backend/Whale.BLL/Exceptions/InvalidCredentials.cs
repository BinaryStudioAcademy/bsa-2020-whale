using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.BLL.Exceptions
{
    public sealed class InvalidCredentials: Exception
    {
        public InvalidCredentials() : base("Invalid credentials") { }
    }
}
