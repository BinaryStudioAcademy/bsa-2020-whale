using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
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

namespace Whale.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<WhaleDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("WhaleDatabase")));
            services.AddControllers();

            var mappingConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile<ContactProfile>();
                mc.AddProfile<UserProfile>();
                mc.AddProfile<ScheduledMeetingProfile>();
            });

            services.AddSingleton(mappingConfig.CreateMapper());

            services.AddTransient<IContactsService, ContactsService>();
            services.AddTransient<IScheduledMeetingsService, ScheduledMeetingsService>();

            services.AddSignalR();
            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
            {
                builder
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithOrigins("http://localhost:4200");
        }));

            services.AddTransient<FileStorageProvider>();

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
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("CorsPolicy");

            app.UseRouting();

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
