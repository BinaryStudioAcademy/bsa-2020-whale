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
    public class RecurrentJobListener : IJobListener
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IMapper _mapper;
        public RecurrentJobListener(IServiceScopeFactory serviceScopeFactory, IMapper mapper)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _mapper = mapper;
            Name = "RecurrentJob";
        }
        public string Name { get; set; }

        public Task JobExecutionVetoed(IJobExecutionContext context, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task JobToBeExecuted(IJobExecutionContext context, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public async Task  JobWasExecuted(IJobExecutionContext context, JobExecutionException jobException, CancellationToken cancellationToken)
        {
            var dataMap = context.JobDetail.JobDataMap;
            var meeting = JsonConvert.DeserializeObject<MeetingAndParticipants>(dataMap.GetString("JobData"));
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var meetingService = scope.ServiceProvider.GetService<MeetingService>();
                meeting.Meeting.StartTime = DateTimeOffset.Now;
                meeting.Meeting.EndTime = null;
                meeting.Meeting.Participants = null;
                meeting.Meeting.Id = Guid.Empty;
                foreach(var ag in meeting.Meeting.AgendaPoints) { ag.Id = Guid.Empty; }
                await meetingService.RegisterRecurrentScheduledMeeting(meeting);
            }
        }
    }
}
