using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Sinks.Elasticsearch;
using System;
using System.Reflection;
using Serilog.Exceptions;
using Whale.API.Models;

namespace Whale.API
{
    public static class ConfigurationService
    {
		public static void ConfigureLogging()
		{
			var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
			var configuration = new ConfigurationBuilder()
				.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
				.Build();

			Log.Logger = new LoggerConfiguration()
				.Enrich.WithExceptionDetails()
				.Enrich.WithReleaseNumber()
				.WriteTo.Elasticsearch(ConfigureElasticSink(configuration, environment))
				.MinimumLevel.Error()
				.CreateLogger();
		}
		private static ElasticsearchSinkOptions ConfigureElasticSink(IConfigurationRoot configuration, string environment)
		{
			return new ElasticsearchSinkOptions(new Uri(configuration["ElasticConfiguration:Uri"]))
			{
				AutoRegisterTemplate = true,
				IndexFormat = $"{Assembly.GetExecutingAssembly().GetName().Name.ToLower().Replace(".", "-")}-{environment?.ToLower().Replace(".", "-")}-{DateTimeOffset.UtcNow:yyyy-MM}"
			};
		}
	}
}
