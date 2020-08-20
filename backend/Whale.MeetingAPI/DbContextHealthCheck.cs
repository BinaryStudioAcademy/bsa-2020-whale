using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Threading;
using System.Threading.Tasks;
using Whale.DAL;

namespace Whale.MeetingAPI
{
    public class DbContextHealthCheck : IHealthCheck
    {
        private readonly WhaleDbContext _dbContext;


        public DbContextHealthCheck(WhaleDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context,
          CancellationToken cancellationToken = new CancellationToken())
        {
            return await _dbContext.Database.CanConnectAsync(cancellationToken)
                    ? HealthCheckResult.Healthy()
                    : HealthCheckResult.Unhealthy();
        }
    }
}
