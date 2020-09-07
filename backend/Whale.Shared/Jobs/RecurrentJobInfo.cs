using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Jobs
{
    public class RecurrentJobInfo
    {
        public Type JobType { get; protected set; }
        public DateTimeOffset JobTime { get; protected set; }
        public JobRecurrenceEnum JobRecurrence { get; set; }
        public Guid JobId { get; set; }
        public RecurrentJobInfo(Type type, DateTimeOffset startTime, JobRecurrenceEnum Recurrence, Guid jobId)
        {
            JobType = type;
            JobTime = startTime;
            JobRecurrence = Recurrence;
            JobId = jobId;
        }
    }
}
