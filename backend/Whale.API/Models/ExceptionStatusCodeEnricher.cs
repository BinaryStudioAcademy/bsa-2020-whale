using Serilog;
using Serilog.Configuration;
using Serilog.Core;
using Serilog.Events;
using System;
using Whale.Shared.Exceptions;

namespace Whale.API.Models
{
    public class ExceptionStatusCodeEnricher : ILogEventEnricher
    {
        public const string PropertyName = "StatusCode";
        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            logEvent.AddPropertyIfAbsent(GetLogEventProperty(logEvent, propertyFactory));
        }

        private LogEventProperty GetLogEventProperty(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            int value = 500;
            if (logEvent.Exception is BaseCustomException ex)
                value = ex._httpError;
            return propertyFactory.CreateProperty(PropertyName, value);
        }
    }
    public static class LoggingExtensions
    {
        public static LoggerConfiguration WithReleaseNumber(
            this LoggerEnrichmentConfiguration enrich)
        {
            if (enrich == null)
                throw new ArgumentNullException(nameof(enrich));

            return enrich.With<ExceptionStatusCodeEnricher>();
        }
    }
}
