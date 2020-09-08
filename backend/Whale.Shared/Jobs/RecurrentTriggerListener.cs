using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Quartz;
using Quartz.Spi;
using System;
using System.Threading;
using System.Threading.Tasks;
using Whale.DAL.Models;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Services;

namespace Whale.Shared.Jobs
{
    public class RecurrentTriggerListener : ITriggerListener
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IMapper _mapper;
        public RecurrentTriggerListener(IServiceScopeFactory serviceScopeFactory, IMapper mapper)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _mapper = mapper;
            Name = "RecurrentJob";
        }
        public string Name { get; set; }

        public Task TriggerFired(ITrigger trigger, IJobExecutionContext context, CancellationToken cancellationToken = default)
        {
            Console.WriteLine("trigger fired");
            Console.WriteLine($"{DateTimeOffset.Now}");

            return Task.CompletedTask;
        }
        public Task TriggerMisfired(ITrigger trigger, CancellationToken cancellationToken = default)
        {
            Console.WriteLine("trigger misfired");
            return Task.CompletedTask;
        }

        public Task<bool> VetoJobExecution(ITrigger trigger, IJobExecutionContext context, CancellationToken cancellationToken = default)
        {
            return Task.Run<bool>(() => false);
        }

        public async Task TriggerComplete(ITrigger trigger, IJobExecutionContext context, SchedulerInstruction triggerInstructionCode, CancellationToken cancellationToken = default)
        {
            Console.WriteLine("JobWasExecuted");
            var dataMap = context.JobDetail.JobDataMap;
            var meeting = JsonConvert.DeserializeObject<MeetingAndParticipants>(dataMap.GetString("JobData"));
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var meetingService = scope.ServiceProvider.GetService<MeetingService>();
                if (meeting.Meeting.StartTime.Day != DateTimeOffset.Now.Day
                    && meeting.Meeting.StartTime.Month != DateTimeOffset.Now.Month
                    )
                {
                    meeting.Meeting.StartTime = DateTimeOffset.Now;
                    Console.WriteLine($"{meeting.Meeting.StartTime}");
                    meeting.Meeting.EndTime = null;
                    meeting.Meeting.Participants = null;
                    meeting.Meeting.Id = Guid.Empty;
                    foreach (var ag in meeting.Meeting.AgendaPoints) { ag.Id = Guid.Empty; }
                    await meetingService.RegisterRecurrentScheduledMeeting(meeting);
                }
            }
        }
    }
}
