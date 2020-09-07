using AutoMapper;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
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
using Whale.Shared.Models;
using Whale.Shared.Services;
using Whale.SignalR.Hubs;
using Whale.SignalR.Services;

namespace Whale.SignalR
{
    public class Startup
    {
        public Startup(IWebHostEnvironment hostingEnvironment)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(hostingEnvironment.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{hostingEnvironment.EnvironmentName}.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<WhaleDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("WhaleDatabase")));
            services.AddTransient<ContactsService>();
            services.AddTransient<NotificationsService>();
            services.AddTransient<MeetingService>();
            services.AddTransient<ParticipantService>();
            services.AddTransient<UserService>();
            services.AddTransient<GroupService>();
            services.AddTransient<WhaleService>();
            services.AddTransient(_ => new MeetingHttpService(Configuration.GetValue<string>("MeetingAPI")));
            services.AddScoped<RoomService>();
            var contextOption = new DbContextOptionsBuilder<WhaleDbContext>();
            services.AddScoped(_ => new MeetingCleanerService(
                contextOption.UseSqlServer(Configuration.GetConnectionString("WhaleDatabase")).Options,
                new RedisService(Configuration.GetConnectionString("RedisOptions"))
                ));

            services.AddTransient(_ => new SignalrService(Configuration.GetValue<string>("SignalR")));
            services.AddScoped(_ => new RedisService(Configuration.GetConnectionString("RedisOptions")));
            services.AddScoped(_ => new EncryptHelper(Configuration.GetValue<string>("EncryptSettings:key")));

            services.AddSingleton(Configuration.GetSection("ElasticConfiguration").Get<ElasticConfiguration>());
            services.AddScoped<ElasticSearchService>();

            services.AddSignalR();
            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
            {
                builder
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithOrigins("http://localhost:4200", "http://bsa2020-whale.westeurope.cloudapp.azure.com");
            }));

            services.AddScoped(_ => Configuration.Bind<BlobStorageSettings>("BlobStorageSettings"));

            services.AddAutoMapper(cfg =>
            {
                cfg.AddProfile<MeetingProfile>();
                cfg.AddProfile<PollProfile>();
                cfg.AddProfile<MeetingMessage>();
                cfg.AddProfile<UserProfile>();
                cfg.AddProfile<ParticipantProfile>();
                cfg.AddProfile<ContactProfile>();
                cfg.AddProfile<DirectMessageProfile>();
                cfg.AddProfile<GroupProfile>();
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

            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

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
