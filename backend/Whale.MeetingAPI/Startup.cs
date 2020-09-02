using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Whale.DAL;
using Whale.Shared.Services;
using AutoMapper;
using System.Reflection;
using Microsoft.OpenApi.Models;
using Whale.MeetingAPI.Services;
using Whale.Shared.MappingProfiles;
using Whale.Shared.Helpers;
using Whale.DAL.Settings;
using Whale.Shared.Exceptions;
using System;
using Whale.MeetingAPI.MappingProfiles;
using Quartz;
using Quartz.Impl;
using Quartz.Spi;
using Whale.Shared.Jobs;
using Whale.DAL.Models;

namespace Whale.MeetingAPI
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

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<WhaleDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("WhaleDatabase")));
            services.AddTransient<MeetingService>();
            services.AddTransient<PollService>();
            services.AddTransient<UserService>();
            services.AddTransient<ParticipantService>();
            services.AddTransient<NotificationsService>();
            services.AddTransient<QuestionService>();
            services.AddTransient(p => new SignalrService(Configuration.GetValue<string>("SignalR")));

            services.AddControllers()
                    .AddNewtonsoftJson(options => options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
            services.AddHealthChecks()
                    .AddDbContextCheck<WhaleDbContext>("DbContextHealthCheck");

            //services.AddHealthChecksUI();
            services.AddSignalR();
            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
            {
                builder
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithOrigins("http://localhost:4200", "http://bsa2020-whale.westeurope.cloudapp.azure.com");
            }));

            services.AddAutoMapper(cfg =>
            {
                cfg.AddProfile<MeetingProfile>();
                cfg.AddProfile<PollProfile>();
                cfg.AddProfile<MeetingMessage>();
                cfg.AddProfile<UserProfile>();
                cfg.AddProfile<ParticipantProfile>();
                cfg.AddProfile<QuestionProfile>();
                cfg.AddProfile<AgendaProfile>();
            },
            Assembly.GetExecutingAssembly());

            services.AddScoped<BlobStorageSettings>(options => Configuration.Bind<BlobStorageSettings>("BlobStorageSettings"));

            services.AddScoped(x => new RedisService(Configuration.GetConnectionString("RedisOptions")));

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Meeting API", Version = "v1" });
            });
            services.AddScoped(x => new EncryptHelper(Configuration.GetValue<string>("EncryptSettings:key")));

            //---Jobs---
            services.AddSingleton<IJobFactory, JobFactory>();
            services.AddSingleton<ScheduledMeetingJob>();
            services.AddTransient<ISchedulerFactory, StdSchedulerFactory>();
            services.AddTransient<MeetingScheduleService>();
            services.AddQuartz(q =>
            {
                q.SchedulerName = "Quartz Scheduler";
                q.UseSimpleTypeLoader();
                q.UseInMemoryStore();
                q.UseDefaultThreadPool(tp =>
                {
                    tp.MaxConcurrency = 10;
                });
            });
            services.AddQuartzServer(opt =>
            {
                opt.WaitForJobsToComplete = true;
            });
            services.AddHostedService<MeetingHostedService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                app.UseSwagger();

                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Meeting API v1");
                });
            }

            app.UseCors("CorsPolicy");

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHealthChecks("/healthAuth").WithMetadata(new AllowAnonymousAttribute()).RequireAuthorization();
                endpoints.MapHealthChecks("/health", new HealthCheckOptions
                {
                    Predicate = _ => true,
                    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
                });
            });
        }
    }
}
