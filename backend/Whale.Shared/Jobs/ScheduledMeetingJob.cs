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
    public class ScheduledMeetingJob : IJob
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public ScheduledMeetingJob(IServiceScopeFactory serviceScopeFactory)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            var dataMap = context.JobDetail.JobDataMap;
            var meeting = JsonConvert.DeserializeObject<Meeting>(dataMap.GetString("JobData"));

            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var meetingService = scope.ServiceProvider.GetService<MeetingService>();
                await meetingService.StartScheduledMeeting(meeting);
            }
        }
    }
}
