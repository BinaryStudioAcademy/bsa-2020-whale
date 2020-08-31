using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using Quartz;
using Quartz.Spi;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.Jobs;

namespace Whale.Shared.Services
{
    public class MeetingHostedService : IHostedService
    {
        private readonly IJobFactory _jobFactory;
        private readonly ISchedulerFactory _schedulerFactory;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private IScheduler _scheduler;
        private Guid _id;
        private IEnumerable<Meeting> _meetings;

        public MeetingHostedService(IJobFactory jobFactory, ISchedulerFactory schedulerFactory,  IServiceScopeFactory serviceScopeFactory)
        {
            _jobFactory = jobFactory;
            _schedulerFactory = schedulerFactory;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
            _scheduler.JobFactory = _jobFactory;

            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var meetingService = scope.ServiceProvider.GetService<MeetingService>();
                _meetings = await meetingService.GetScheduledMeetins();
            }

            foreach (var meeting in _meetings)
            {
                var data = JsonConvert.SerializeObject(meeting);
                _id = Guid.NewGuid();

                var job = JobBuilder.Create<ScheduledMeetingJob>()
                .WithIdentity($"{_id}-job")
                .UsingJobData($"JobData", data)
                .Build();

                var trigger = TriggerBuilder.Create()
                    .WithIdentity($"{_id}.trigger")
                    .StartNow()
                    .Build();

                await _scheduler.ScheduleJob(job, trigger, cancellationToken);
            }

            await _scheduler.Start(cancellationToken);
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            await _scheduler?.Shutdown(cancellationToken);
        }
    }
}
