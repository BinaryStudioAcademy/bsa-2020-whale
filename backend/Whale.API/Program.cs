using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace Whale.API
{
    public static class Program
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
                    webBuilder.UseStartup<Startup>()
					.UseSerilog();
                });
    }
}
