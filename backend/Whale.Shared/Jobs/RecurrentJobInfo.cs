using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Jobs
{
    public class RecurrentJobInfo
    {
        

        public Type JobType { get; protected set; }
        public DateTimeOffset JobTime { get; protected set; }
        public JobRecurrencyEnum JobRecurrency { get; set; }

        public RecurrentJobInfo(Type type, DateTimeOffset startTime, JobRecurrencyEnum recurrency)
        {
            JobType = type;
            JobTime = startTime;
            JobRecurrency = recurrency;
        }
    }
}
