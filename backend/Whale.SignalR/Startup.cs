using AutoMapper;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Reflection;
using Whale.DAL;
using Whale.DAL.Settings;
using Whale.Shared.Exceptions;
using Whale.Shared.Helpers;
using Whale.Shared.MappingProfiles;
using Whale.Shared.Services;
using Whale.SignalR.Hubs;

namespace Whale.SignalR
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment hostingEnvironment)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(hostingEnvironment.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{hostingEnvironment.EnvironmentName}.json", reloadOnChange: true, optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }


        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<WhaleDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("WhaleDatabase")));
            services.AddTransient<NotificationsService>();
            services.AddTransient<ContactsService>();
            services.AddTransient<MeetingService>();
            services.AddTransient<ParticipantService>();
            services.AddTransient<UserService>();
            services.AddTransient<WhaleService>();

            services.AddScoped(x => new RedisService(Configuration.GetConnectionString("RedisOptions")));
            services.AddScoped(x => new EncryptHelper(Configuration.GetValue<string>("EncryptSettings:key")));

            services.AddSignalR();
            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
            {
                builder
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithOrigins("http://localhost:4200", "http://bsa2020-whale.westeurope.cloudapp.azure.com");
            }));

            services.AddScoped<BlobStorageSettings>(options => Configuration.Bind<BlobStorageSettings>("BlobStorageSettings"));

            services.AddAutoMapper(cfg =>
            {
                cfg.AddProfile<MeetingProfile>();
                cfg.AddProfile<PollProfile>();
                cfg.AddProfile<MeetingMessage>();
                cfg.AddProfile<UserProfile>();
                cfg.AddProfile<ParticipantProfile>();
                cfg.AddProfile<ContactProfile>();
                cfg.AddProfile<DirectMessageProfile>();
                cfg.AddProfile<NotificationProfile>();
            },
            Assembly.GetExecutingAssembly());
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("CorsPolicy");

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<ChatHub>("/chatHub");
                endpoints.MapHub<MeetingHub>("/meeting");
                endpoints.MapHub<WhaleHub>("/whale");
            });
        }
    }
}
