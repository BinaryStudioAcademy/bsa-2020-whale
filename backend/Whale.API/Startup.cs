using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Whale.API.Services;
using System.Net.Http;
using Whale.API.MappingProfiles;
using Whale.API.Middleware;
using Whale.API.Providers;
using Whale.DAL;
using Whale.DAL.Settings;
using Whale.Shared.Exceptions;
using Whale.Shared.Helpers;
using Whale.Shared.MappingProfiles;
using Whale.Shared.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Whale.Shared.Models;
using Nest;

namespace Whale.API
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

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<WhaleDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("WhaleDatabase")));
            services.AddControllers()
                    .AddNewtonsoftJson(options => options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

            var mappingConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile<ContactProfile>();
                mc.AddProfile<UserProfile>();
                mc.AddProfile<ScheduledMeetingProfile>();
                mc.AddProfile<DirectMessageProfile>();
                mc.AddProfile<MeetingProfile>();
                mc.AddProfile<ParticipantProfile>();
                mc.AddProfile<PollProfile>();
                mc.AddProfile<MeetingMessage>();
                mc.AddProfile<GroupProfile>();
                mc.AddProfile<GroupMessageProfile>();
                mc.AddProfile<GroupUserProfile>();
                mc.AddProfile<NotificationProfile>();
            });

            services.AddSingleton(mappingConfig.CreateMapper());
            var contextOption = new DbContextOptionsBuilder<WhaleDbContext>();
            services.AddScoped(_ => new MeetingCleanerService(
                contextOption.UseSqlServer(Configuration.GetConnectionString("WhaleDatabase")).Options,
                new RedisService(Configuration.GetConnectionString("RedisOptions"))
                ));

            services.AddTransient<SlackService>();
            services.AddTransient<NotificationsService>();
            services.AddTransient<ContactsService>();
            services.AddTransient<UserService>();
            services.AddTransient<ScheduledMeetingsService>();
            services.AddTransient<ContactChatService>();
            services.AddTransient<MeetingHistoryService>();
            services.AddTransient<MeetingService>();
            services.AddTransient<ParticipantService>();
            services.AddTransient<GroupService>();
            services.AddTransient<GroupChatService>();
            services.AddTransient<ExternalScheduledMeetingService>();
            services.AddScoped(_ => new RedisService(Configuration.GetConnectionString("RedisOptions")));
            services.AddScoped<HttpClient>();
            services.AddTransient(p => new HttpService(p.GetRequiredService<HttpClient>(), Configuration.GetValue<string>("MeetingAPI")));
            services.AddTransient(_ => new SignalrService(Configuration.GetValue<string>("SignalR")));
            services.AddTransient<EmailService>();
            services.Configure<SendGridSettings>(settings => settings.ApiKey = Configuration.GetValue<string>("WhaleSendGridApiKey"));

            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
            {
                builder
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithOrigins("http://localhost:4200", "http://bsa2020-whale.westeurope.cloudapp.azure.com");
            }));

            services.AddScoped(_ => Configuration.Bind<BlobStorageSettings>("BlobStorageSettings"));
            services.AddScoped<FileStorageProvider>();

            services.AddSingleton(Configuration.GetSection("ElasticConfiguration").Get<ElasticConfiguration>());
            services.AddTransient<ElasticSearchService>();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(opt =>
                {
                    opt.Authority = Configuration["FirebaseAuthentication:Issuer"];
                    opt.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = Configuration["FirebaseAuthentication:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = Configuration["FirebaseAuthentication:Audience"],
                        ValidateLifetime = true
                    };
                });

            services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "Whale API", Version = "v1" }));
            services.AddScoped(_ => new EncryptHelper(Configuration.GetValue<string>("EncryptSettings:key")));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                app.UseSwagger();

                app.UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "Whale API v1"));
            }

            app.UseMiddleware<ExceptionMiddleware>();

            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            app.UseCors("CorsPolicy");

            app.UseRouting();

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints => endpoints.MapControllers());
        }
    }
}
