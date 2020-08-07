using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Whale.BLL.Exceptions;

namespace Whale.API.Extensions
{
    public static class ExceptionFilterExtensions
    {
        public static (HttpStatusCode statusCode, ErrorCode errorCode) ParseException(this Exception exception)
        {
            switch (exception)
            {
                case NotFoundException _:
                    return (HttpStatusCode.NotFound, ErrorCode.NotFound);
                case InvalidTokenException _:
                    return (HttpStatusCode.Unauthorized, ErrorCode.InvalidToken);
                case ExpiredRefreshTokenException _:
                    return (HttpStatusCode.Unauthorized, ErrorCode.ExpiredRefreshToken);
                default:
                    return (HttpStatusCode.InternalServerError, ErrorCode.General);
            }
        }
    }
}
