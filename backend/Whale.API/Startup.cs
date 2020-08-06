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
using Microsoft.IdentityModel.Tokens;
using AspNetCore.Firebase.Authentication.Extensions;

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

            services.AddSignalR();
            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
            {
                builder
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithOrigins("http://localhost:4200");
            }));
            //services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            //    .AddJwtBearer(opt =>
            //    {
            //        opt.Authority = "https://securetoken.google.com/bsa-whale";
            //        opt.TokenValidationParameters = new TokenValidationParameters
            //        {
            //            ValidateIssuer = true,
            //            ValidIssuer = "https://securetoken.google.com/bsa-whale",
            //            ValidateAudience = true,
            //            ValidAudience = "bsa-whale",
            //            ValidateLifetime = true
            //        };
            //    });
            services.AddFirebaseAuthentication(Configuration["FirebaseAuthentication:Issuer"], Configuration["FirebaseAuthentication:Audience"]);
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
                endpoints.MapHub<ChatHub>("/chatHub");
            });
        }
    }
}
