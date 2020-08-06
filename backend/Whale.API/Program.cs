using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

namespace Whale.API
{
    public class Program
    {
		public static void Main(string[] args)
		{
			ConfigurationService.ConfigureLogging();
			CreateHost(args);
		}
		private static void CreateHost(string[] args)
		{
			try
			{
				CreateHostBuilder(args).Build().Run();
			}
			catch (System.Exception ex)
			{
				Log.Fatal($"Failed to start {Assembly.GetExecutingAssembly().GetName().Name}", ex);
				throw;
			}
		}

		public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
