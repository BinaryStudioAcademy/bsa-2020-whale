using System;

namespace Whale.Shared.Jobs
{
    public class JobInfo
    {
        public Type JobType { get; protected set; }
        public DateTimeOffset JobTime { get; protected set; }

        public JobInfo(Type jobType, DateTimeOffset jobTime)
        {
            JobType = jobType;
            JobTime = jobTime;
        }
    }
}
