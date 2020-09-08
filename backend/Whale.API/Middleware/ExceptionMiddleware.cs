using Microsoft.AspNetCore.Http;
using Serilog;
using System;
using System.Threading.Tasks;
using Whale.API.Models;
using Whale.Shared.Exceptions;

namespace Whale.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception e)
            {
                Log.Logger.Error(e, e.Message);
                await HandleExceptionAsync(httpContext, e);
            }
        }
        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            if (exception is BaseCustomException ex)
                context.Response.StatusCode = ex._httpError;
            else
                context.Response.StatusCode = 500;

            return context.Response.WriteAsync(new ErrorDetails()
            {
                StatusCode = context.Response.StatusCode,
                Message = exception.Message,
                Detailed = exception.ToString()
            }.ToString());
        }
    }
}
