using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.BLL.Exceptions
{

    public sealed class ExpiredRefreshTokenException : Exception
    {
        public ExpiredRefreshTokenException() : base("Refresh token expired.") { }
    }
}
