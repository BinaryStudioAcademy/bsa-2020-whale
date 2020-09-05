using Quartz;
using Quartz.Spi;
using System;
using System.Threading.Tasks;
using Whale.Shared.Jobs;

namespace Whale.Shared.Services
{
    public class MeetingScheduleService
    {
        private readonly IJobFactory _jobFactory;
        private readonly ISchedulerFactory _schedulerFactory;
        private readonly Guid id;
        private IScheduler scheduler;

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
                .UsingJobData("JobData", obj)
                .Build();
        }

        private ITrigger CreateTrigger(JobInfo jobInfo)
        {
            return TriggerBuilder
                .Create()
                .WithIdentity($"{id}-trigger")
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
