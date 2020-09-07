using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Timers;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Poll;
using Whale.Shared.Exceptions;
using Whale.Shared.Models.Meeting;

namespace Whale.Shared.Services
{
    public class MeetingCleanerService
    {
        private const string meetingSettingsPrefix = "meeting-settings-";
        private const string meetingSpeechPrefix = "meeting-speech-";
        private readonly RedisService _redisService;
        private readonly DbContextOptions<WhaleDbContext> _contextOptions;

        public MeetingCleanerService(DbContextOptions<WhaleDbContext> contextOptions, RedisService redisService)
        {
            _redisService = redisService;
            _contextOptions = contextOptions;
        }

        public void DeleteMeetingIfNoOneEnter(Guid meetingId, string fullUrl, string shortUrl)
        {
            var timer = new Timer(60 * 60 * 1000);

            timer.Elapsed += async (sender, e) =>
            {
                timer.Stop();
                timer.Dispose();

                await _redisService.ConnectAsync();
                var meetingData = await _redisService.GetAsync<MeetingRedisData>(meetingId.ToString());

                if (meetingData is null) return;

                if (meetingData.Participants.Count == 0)
                {
                    var context = new WhaleDbContext(_contextOptions);
                    var meeting = await context.Meetings.FirstOrDefaultAsync(m => m.Id == meetingId);
                    meeting.Participants = await context.Participants.Where(p => p.MeetingId == meeting.Id).ToListAsync();

                    if (meeting == null)
                    {
                        throw new NotFoundException(nameof(Meeting));
                    }

                    var fullURL = $"?id={meetingId}&pwd={meetingData.Password}";
                    var shortUrl = await _redisService.GetAsync<string>(fullURL);

                    await _redisService.RemoveAsync(meetingId.ToString());
                    await _redisService.RemoveAsync(fullURL);
                    await _redisService.RemoveAsync(shortUrl);
                    await _redisService.RemoveAsync($"{meetingSettingsPrefix}{meetingId}");
                    await _redisService.RemoveAsync($"{meetingSpeechPrefix}{meetingId}");
                    await _redisService.RemoveAsync(meetingId + nameof(Poll));

                    if (meeting.EndTime is null)
                    {
                        meeting.EndTime = DateTimeOffset.Now;
                        context.Meetings.Update(meeting);
                        await context.SaveChangesAsync();
                    }
                }
            };

            timer.Start();
        }
    }
}
