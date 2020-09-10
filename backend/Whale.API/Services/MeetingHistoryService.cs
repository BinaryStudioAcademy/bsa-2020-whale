using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Settings;
using Whale.Shared.Exceptions;
using Whale.Shared.Extentions;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.User;
using Whale.Shared.Services;

namespace Whale.API.Services
{
    public class MeetingHistoryService : BaseService
    {
        private readonly BlobStorageSettings _blobStorageSettings;
        private readonly ElasticSearchService _elasticSearchService;

        public MeetingHistoryService(WhaleDbContext context, IMapper mapper, BlobStorageSettings blobStorageSettings, ElasticSearchService elasticSearchService)
            : base(context, mapper)
        {
            _blobStorageSettings = blobStorageSettings;
            _elasticSearchService = elasticSearchService;
        }
        public async Task<IEnumerable<MeetingDTO>> GetMeetingsWithParticipantsAndPollResultsAsync(Guid userId, int skip, int take)
        {
            var meetings = await _context.Participants
                .Include(p => p.Meeting)
                    .ThenInclude(m => m.PollResults)
                .Where(p => p.UserId == userId && p.Meeting.EndTime != null && p.Meeting.EndTime != p.Meeting.StartTime)
                .Select(p => p.Meeting)
                .OrderByDescending(m => m.StartTime)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            var allParticipnts = await _context.Participants.Include(p => p.User).ToListAsync();

            var meetingTasks = meetings
                 .GroupJoin(
                    allParticipnts,
                    m => m.Id,
                    p => p.MeetingId,
                    (m, pGroup) => new Meeting(m, pGroup))
                .AsParallel()
                .Select(async m =>
                {
                    m.Participants = await m.Participants.LoadAvatarsAsync(_blobStorageSettings, p => p.User);
                    var mDto = _mapper.Map<MeetingDTO>(m);
                    var stats = await _elasticSearchService.SearchSingleAsync(userId, m.Id);
                    if (stats != null)
                    {
                        mDto.SpeechDuration = stats.SpeechTime;
                        mDto.PresenceDuration = stats.PresenceTime;
                    }
                    return mDto;
                });

            var meetingList = await Task.WhenAll(meetingTasks);
            return meetingList;
        }

        public async Task<IEnumerable<MeetingSpeechDTO>> GetMeetingScriptAsync(Guid meetingId)
        {
            var scriptJson = await _context.MeetingScripts.FirstOrDefaultAsync(m => m.MeetingId == meetingId);
            if (scriptJson is null)
                throw new NotFoundException("MeetingScripts", meetingId.ToString());

            var script = JsonConvert.DeserializeObject<IEnumerable<MeetingSpeech>>(scriptJson.Script);
            var scriptTasks = script.OrderBy(m => m.SpeechDate).Join(_context.Users, m => m.UserId, u => u.Id,
                async (m, u) => new MeetingSpeechDTO
                {
                    User = _mapper.Map<UserDTO>(await u.LoadAvatarAsync(_blobStorageSettings)),
                    Message = m.Message,
                    SpeechDate = m.SpeechDate
                }
            );
            return (await Task.WhenAll(scriptTasks)).ToList();
        }
    }
}
