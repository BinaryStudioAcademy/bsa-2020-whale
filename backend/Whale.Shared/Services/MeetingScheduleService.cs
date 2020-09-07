using Microsoft.Extensions.Hosting;
using Quartz;
using Quartz.Impl;
using Quartz.Impl.Matchers;
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
        private static IDictionary<JobRecurrenceEnum, int> dict = new Dictionary<JobRecurrenceEnum, int>() {
            { JobRecurrenceEnum.EveryDay, 24 },
            { JobRecurrenceEnum.EveryWeek, 24*7 },
            { JobRecurrenceEnum.EveryMonth, 24*7*4 },
           
        };
        private static ReadOnlyDictionary<JobRecurrenceEnum, int> RecurrenceLenght = new ReadOnlyDictionary<JobRecurrenceEnum, int>(dict);
        private readonly IJobFactory _jobFactory;
        private readonly ISchedulerFactory _schedulerFactory;
        private IScheduler scheduler;
        private Guid id;
        private IJobListener _jobListener;
        public MeetingScheduleService(IJobFactory jobFactory, ISchedulerFactory schedulerFactory, IJobListener jobListener)
        {
            _jobFactory = jobFactory;
            _jobListener = jobListener;
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

        private IJobDetail CreateRecurrentJob(RecurrentJobInfo jobInfo, string obj)
        {
            return JobBuilder
                .Create(jobInfo.JobType)
                .WithIdentity($"{jobInfo.JobId}-job")
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
                .WithIdentity($"{jobInfo.JobId}-trigger")
                .StartAt(jobInfo.JobTime)
                .WithSimpleSchedule(x => x
                .WithIntervalInMinutes(RecurrenceLenght[jobInfo.JobRecurrence])
                    .RepeatForever())
                .Build();
        }

        public async Task StartAsync(JobInfo jobInfo, string obj)
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
            scheduler.ListenerManager.AddJobListener(_jobListener);

            var job = CreateRecurrentJob(jobInfo, obj);
            var trigger = CreateRecurrentTrigger(jobInfo);
            await scheduler.ScheduleJob(job, trigger);
            await scheduler.Start();
        }

        public async Task StopRecurrent(Guid id)
        {
            await scheduler.DeleteJob(new JobKey($"{id}-job"));
        }

        public async Task StopAsync()
        {
            scheduler = await _schedulerFactory.GetScheduler();
            scheduler.JobFactory = _jobFactory;

            await scheduler?.Shutdown();
        }
    }
}
