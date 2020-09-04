using Microsoft.Extensions.Hosting;
using Quartz;
using Quartz.Impl;
using Quartz.Spi;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Threading.Tasks;
using Whale.Shared.Jobs;

namespace Whale.Shared.Services
{
    public class MeetingScheduleService
    {
        private static IDictionary<JobRecurrencyEnum, int> dict = new Dictionary<JobRecurrencyEnum, int>() {
            { JobRecurrencyEnum.EveryDay, 1 },
            { JobRecurrencyEnum.EveryWeek, 24*7 },
            { JobRecurrencyEnum.EveryMonth, 24*7*4 },
           
        };
        private static ReadOnlyDictionary<JobRecurrencyEnum, int> recurrencyLenght = new ReadOnlyDictionary<JobRecurrencyEnum, int>(dict);
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

        private IJobDetail CreateRecurrentJob(RecurrentJobInfo jobInfo, string obj)
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
                .WithIdentity($"{id}-trigger")
                .StartAt(jobInfo.JobTime)
                .ForJob($"{id}-job")
                .Build();
        }

        private ITrigger CreateRecurrentTrigger(RecurrentJobInfo jobInfo)
        {
            return TriggerBuilder
                .Create()
                .WithIdentity($"{id}-trigger")
                .StartAt(jobInfo.JobTime)
                .WithSimpleSchedule(x => x
                .WithIntervalInMinutes(recurrencyLenght[jobInfo.JobRecurrency])
                    .RepeatForever())
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

        public async Task StartRecurrent(RecurrentJobInfo jobInfo, string obj)
        {
            scheduler = await _schedulerFactory.GetScheduler();
            scheduler.JobFactory = _jobFactory;
            var job = CreateRecurrentJob(jobInfo, obj);
            var trigger = CreateRecurrentTrigger(jobInfo);
            await scheduler.ScheduleJob(job, trigger);
            await scheduler.Start();
        }


        public async Task Stop()
        {
            await scheduler?.Shutdown();
        }
    }
}
