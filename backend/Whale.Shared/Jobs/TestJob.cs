using Quartz;
using System.Diagnostics;
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
