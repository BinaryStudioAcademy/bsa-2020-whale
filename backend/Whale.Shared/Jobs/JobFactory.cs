using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Quartz.Spi;
using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Jobs
{
    public class JobFactory : IJobFactory
    {
        //private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IServiceProvider _serviceProvider;

        public JobFactory(IServiceProvider serviceProvider)
        {
            //_serviceScopeFactory = serviceScopeFactory;
            _serviceProvider = serviceProvider;
        }

        public IJob NewJob(TriggerFiredBundle bundle, IScheduler scheduler)
        {
            //using (var scope = _serviceScopeFactory.CreateScope())
            //    return scope.ServiceProvider.GetService(bundle.JobDetail.JobType) as IJob;
            return _serviceProvider.GetRequiredService(bundle.JobDetail.JobType) as IJob;
        }

        public void ReturnJob(IJob job) { }
    }
}
