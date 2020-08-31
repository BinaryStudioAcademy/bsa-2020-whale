using Microsoft.Extensions.Hosting;
using Quartz;
using Quartz.Impl;
using Quartz.Spi;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Whale.Shared.Jobs;

namespace Whale.Shared.Services
{
    public class MeetingScheduleService
    {
        private readonly IJobFactory _jobFactory;
        private readonly ISchedulerFactory _schedulerFactory;
        private IScheduler scheduler;
        private Guid id;

        public MeetingScheduleService(IJobFactory jobFactory, ISchedulerFactory schedulerFactory)
        {
            _jobFactory = jobFactory;
            _schedulerFactory = schedulerFactory;
            id = Guid.NewGuid();
        }

        private IJobDetail CreateJob(JobInfo jobInfo, string obj)
        {
            return JobBuilder
                .Create(jobInfo.JobType)
                .WithIdentity($"{id}-job")
                .UsingJobData($"JobData", obj)
                .Build();
        }

        private ITrigger CreateTrigger(JobInfo jobInfo)
        {
            return TriggerBuilder
                .Create()
                .WithIdentity("test.trigger")
                .StartAt(jobInfo.JobTime)
                .ForJob($"{id}-job")
                .Build();
        }

        public async Task Start(JobInfo jobInfo, string obj)
        {
            scheduler = await _schedulerFactory.GetScheduler();
            scheduler.JobFactory = _jobFactory;
            var job = CreateJob(jobInfo, obj);
            var trigger = CreateTrigger(jobInfo);
            await scheduler.ScheduleJob(job, trigger);
            await scheduler.Start();
        }

        public async Task Stop()
        {
            await scheduler?.Shutdown();
        }
    }
}
