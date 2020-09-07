using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Quartz;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Whale.DAL.Models;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Services;


namespace Whale.Shared.Jobs
{
    public class RecurrentScheduledMeetingJob : IJob
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IMapper _mapper;

        public RecurrentScheduledMeetingJob(IServiceScopeFactory serviceScopeFactory, IMapper mapper)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _mapper = mapper;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            var dataMap = context.JobDetail.JobDataMap;
            var meeting = JsonConvert.DeserializeObject<MeetingAndParticipants>(dataMap.GetString("JobData"));

            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var meetingService = scope.ServiceProvider.GetService<MeetingService>();
                var meetinG = await meetingService.GetScheduledMeeting(meeting.Meeting.Id);
                await meetingService.StartScheduledMeetingAsync(meetinG);
            }
        }
    }
}
