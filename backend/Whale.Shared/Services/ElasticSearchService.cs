using Nest;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Exceptions;
using Whale.Shared.Models;
using Whale.Shared.Models.ElasticModels.Statistics;

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
            var getResponse = await _elasticClient.GetAsync<MeetingUserStatistics>(record.Id, r => r.Index(indexName));
            record.DurationTime = (long)record.EndDate.Subtract(record.StartDate).TotalMilliseconds;
            if (getResponse.Found)
            {
                record.SpeechTime += getResponse.Source.SpeechTime;
                record.PresenceTime += getResponse.Source.PresenceTime;
            }
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

        public async Task<MeetingUserStatistics> SearchSingleAsync(Guid userId, Guid meetingId)
        {
            var indexName = $"{indexPrefix}{userId.ToString()}";
            var id = $"{userId.ToString()}{meetingId.ToString()}";
            var getResponse = await _elasticClient.GetAsync<MeetingUserStatistics>(id, r => r.Index(indexName));
            return getResponse.Source;
        }

        public async Task<IEnumerable<DateHistogramBucket>> SearchStatistics(string email, DateTime startDate, DateTime endDate)
        {
            var user = await _userService.GetUserByEmailAsync(email);
            var indexName = $"{indexPrefix}{user.Id}";
            if (user == null) throw new NotFoundException("User", email);

            var response = await _elasticClient.SearchAsync<MeetingUserStatistics>(s => s
                .Index(indexName)
                .Size(0)
                .Query(q => q
                    .DateRange(d => d
                        .Field(f => f.EndDate)
                        .LessThanOrEquals(endDate)
                        .GreaterThanOrEquals(startDate)))
                .Aggregations(a => a
                    .DateHistogram("dateHistogram", h => h
                        .Field(f => f.EndDate)
                        .CalendarInterval(DateInterval.Day)
                        .MinimumDocumentCount(1)
                        .Aggregations(aa => aa
                            .Min("minDuration", ma => ma
                                .Field(f => f.DurationTime))
                            .Max("maxDuration", ma => ma
                                .Field(f => f.DurationTime))
                            .Average("avgDuration", aa => aa
                                .Field(f => f.DurationTime))
                             .Min("minSpeech", ma => ma
                                .Field(f => f.SpeechTime))
                            .Max("maxSpeech", ma => ma
                                .Field(f => f.SpeechTime))
                            .Average("avgSpeech", aa => aa
                                .Field(f => f.SpeechTime))
                            .Min("minPresence", ma => ma
                                .Field(f => f.PresenceTime)) 
                            .Max("maxPresence", ma => ma
                                .Field(f => f.PresenceTime))
                            .Average("avgPresence", aa => aa
                                .Field(f => f.PresenceTime))
                            .Min("date", m => m
                                .Field(f => f.EndDate)
                                .Format("yyyy-MM-dd"))
                            .ValueCount("docCount", c => c
                                .Field(f => f.EndDate))
                  )))
                );
            
            return response.Aggregations.DateHistogram("dateHistogram").Buckets;
        }

        public async Task<AggregateDictionary> SearchAllTimeStatistics(string email)
        {
            var user = await _userService.GetUserByEmailAsync(email);
            var indexName = $"{indexPrefix}{user.Id}";
            if (user == null) throw new NotFoundException("User", email);

            var response = await _elasticClient.SearchAsync<MeetingUserStatistics>(s => s
                .Index(indexName)
                .Size(0)
                .Aggregations(aa => aa
                    .Min("minDuration", ma => ma
                        .Field(f => f.DurationTime))
                    .Max("maxDuration", ma => ma
                        .Field(f => f.DurationTime))
                    .Average("avgDuration", aa => aa
                        .Field(f => f.DurationTime))
                    .Min("minSpeech", ma => ma
                        .Field(f => f.SpeechTime))
                    .Max("maxSpeech", ma => ma
                        .Field(f => f.SpeechTime))
                    .Average("avgSpeech", aa => aa
                        .Field(f => f.SpeechTime))
                    .Min("minPresence", ma => ma
                        .Field(f => f.PresenceTime))
                    .Max("maxPresence", ma => ma
                        .Field(f => f.PresenceTime))
                    .Average("avgPresence", aa => aa
                        .Field(f => f.PresenceTime))
                    .ValueCount("docCount", c => c
                                .Field(f => f.EndDate))));
            return response.Aggregations;
        }
    }
}
