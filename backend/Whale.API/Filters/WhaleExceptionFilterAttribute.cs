using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Serilog;
using System;
using Whale.API.Extensions;

namespace Whale.API.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class WhaleExceptionFilterAttribute : ExceptionFilterAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            var (statusCode, errorCode) = context.Exception.ParseException();
            Log.Logger.Information(context.Exception.Message);

            context.HttpContext.Response.ContentType = "application/json";
            context.HttpContext.Response.StatusCode = (int)statusCode;
            context.Result = new JsonResult(new
            {
                error = context.Exception.Message,
                code = errorCode
            });
            context.ExceptionHandled = true;

        }
    }
}
