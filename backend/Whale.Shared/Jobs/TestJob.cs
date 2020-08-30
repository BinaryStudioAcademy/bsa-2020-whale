using Quartz;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;

namespace Whale.Shared.Jobs
{
    public class TestJob : IJob
    {
        public Task Execute(IJobExecutionContext context)
        {
            Debug.WriteLine("DONE");
            return Task.CompletedTask;
        }
    }
}
