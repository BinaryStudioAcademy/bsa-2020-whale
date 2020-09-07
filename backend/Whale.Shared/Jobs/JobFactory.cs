using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Quartz.Spi;

namespace Whale.Shared.Jobs
{
    public class JobFactory : IJobFactory
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public JobFactory(IServiceScopeFactory serviceScopeFactory)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }

        public IJob NewJob(TriggerFiredBundle bundle, IScheduler scheduler)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            return scope.ServiceProvider.GetService(bundle.JobDetail.JobType) as IJob;
        }

        public void ReturnJob(IJob job) { }
    }
}
