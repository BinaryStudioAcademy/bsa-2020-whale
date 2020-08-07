using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.API.Extensions
{
    public enum ErrorCode
    {
        General = 1,
        NotFound,
        InvalidUsernameOrPassword,
        InvalidToken,
        ExpiredRefreshToken
    }
}
