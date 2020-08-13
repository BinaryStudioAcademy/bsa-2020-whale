using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Whale.BLL.Hubs;
using Whale.DAL;
using Microsoft.EntityFrameworkCore;
using Whale.BLL.Services;
using AutoMapper;
using Whale.BLL.MappingProfiles;
using Whale.BLL.Providers;
using Microsoft.IdentityModel.Tokens;
using Whale.Shared.Services;
using Whale.BLL.Services.Interfaces;
using Whale.DAL.Settings;
using Whale.API.Extensions;
using Whale.API.Middleware;
using Whale.BLL.Interfaces;
using Microsoft.OpenApi.Models;
using Whale.Shared.Helper;

namespace Whale.API
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
            services.AddControllers()
                    .AddNewtonsoftJson(options => options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
            var mappingConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile<ContactProfile>();
                mc.AddProfile<UserProfile>();
                mc.AddProfile<ScheduledMeetingProfile>();
                mc.AddProfile<DirectMessageProfile>();
                mc.AddProfile<MeetingProfile>();
                mc.AddProfile<MeetingMessage>();
                mc.AddProfile<ParticipantProfile>();
            });

            services.AddSingleton(mappingConfig.CreateMapper());

            services.AddTransient<IContactsService, ContactsService>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IScheduledMeetingsService, ScheduledMeetingsService>();
            services.AddTransient<ContactChatService>();
            services.AddTransient<IMeetingService, MeetingService>();
            services.AddTransient<ParticipantService>();

            services.AddSignalR();
            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
            {
                builder
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithOrigins("http://localhost:4200", "http://bsa2020-whale.westeurope.cloudapp.azure.com");
        }));

            services.AddTransient<FileStorageProvider>(x => new FileStorageProvider(Configuration.Bind<BlobStorageSettings>("BlobStorageSettings")));

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
            services.AddScoped<RedisService>(x => new RedisService(Configuration.GetConnectionString("RedisOptions")));

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Whale API", Version = "v1" });
            });
            services.AddScoped(x => new EncryptService(Configuration.GetValue<string>("EncryptSettings:key")));

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
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Whale API v1");
                });
            }

            app.UseMiddleware<ExceptionMiddleware>();

            app.UseCors("CorsPolicy");

            app.UseRouting();

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<ChatHub>("/chatHub");
            });
        }
    }
}
