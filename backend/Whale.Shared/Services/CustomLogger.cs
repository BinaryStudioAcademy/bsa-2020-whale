using Serilog;
using Serilog.Events;
using Serilog.Sinks.Elasticsearch;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Models;
using Whale.Shared.Models.Statistics;

namespace Whale.Shared.Services
{    
    public class CustomLogger
    {
        private readonly ILogger _meetingStatsLogger;
        public CustomLogger(ElasticConfiguration config)
        {
            _meetingStatsLogger = new LoggerConfiguration()
                .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(config.Uri))
                {
                    AutoRegisterTemplate = true,
                    IndexFormat = "meeting-statistics"
                })
                .CreateLogger();
        }

        public void WriteMeetingStats(MeetingStatistics meetingStatistics)
        {
            _meetingStatsLogger.Write(LogEventLevel.Information, "{@FlogDetail}", meetingStatistics);
        }
    }
}
