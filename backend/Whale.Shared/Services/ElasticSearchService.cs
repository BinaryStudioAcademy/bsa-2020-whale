using Nest;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Whale.Shared.Exceptions;
using Whale.Shared.Models;
using Whale.Shared.Models.Statistics;

namespace Whale.Shared.Services
{
    public class ElasticSearchService
    {
        private readonly UserService _userService;
        private readonly ElasticClient _elasticClient;
        private const string indexPrefix = "statistics-user-";

        public ElasticSearchService(ElasticConfiguration elasticConfiguration, UserService userService)
        {
            var hostUrl = elasticConfiguration.Uri;

            var seetings = new ConnectionSettings(new Uri(hostUrl));
            _elasticClient = new ElasticClient(seetings);
            _userService = userService;
        }

        public async Task SaveSingleAsync(MeetingUserStatistics record)
        {
            var indexName = $"{indexPrefix}{record.UserId.ToString()}";
            await _elasticClient.IndexAsync(record, i => i.Index(indexName));
            
        }

        public async Task SaveRangeAsync(IEnumerable<MeetingUserStatistics> records)
        {
            var first = records.FirstOrDefault();
            if(first != null)
            {
                var indexName = $"{indexPrefix}{first.UserId}";
                await _elasticClient.IndexManyAsync(records, indexName);
            }
        }

        public async Task<IReadOnlyCollection<DateHistogramBucket>> SearchStatistics(string email)
        {
            var user = await _userService.GetUserByEmail(email);
            var indexName = $"{indexPrefix}{user.Id.ToString()}";
            if (user == null) throw new NotFoundException("User", email);

            var response = await _elasticClient.SearchAsync<MeetingUserStatistics>(s => s
                .Index(indexName)
                .Size(0)
                .Query(q => q
                    .DateRange(d => d
                        .Field(f => f.EndDate)
                        .LessThanOrEquals(DateMath.Now
                        .Add(TimeSpan.FromDays(1)).RoundTo(DateMathTimeUnit.Hour))
                        .GreaterThanOrEquals(DateMath.Now.Subtract(TimeSpan.FromDays(7)).RoundTo(DateMathTimeUnit.Hour))))
               .Aggregations(a => a
                    .DateHistogram("date_histogram", h => h
                        .Field(f => f.EndDate)
                        .CalendarInterval(DateInterval.Day)
                        .Order(HistogramOrder.CountAscending)
                        .Format("MM-dd")
                        .Aggregations(aa => aa
                            .Min("min_duration", ma => ma
                                .Field(f => f.DurationTime))
                            .Max("max_duration", ma => ma
                                .Field(f => f.DurationTime))
                            .Average("average-duration", aa => aa
                                .Field(f => f.DurationTime))))));

            return response.Aggregations.DateHistogram("date_histogram").Buckets;

        }
    }
}
