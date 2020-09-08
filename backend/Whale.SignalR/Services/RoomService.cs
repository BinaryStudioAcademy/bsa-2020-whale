using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Timers;
using Whale.DAL.Models.Poll;
using Whale.DAL.Models.Question;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.Participant;
using Whale.Shared.Services;
using Whale.SignalR.Hubs;

namespace Whale.SignalR.Services
{
    public class RoomService
    {
        private const string meetingSettingsPrefix = "meeting-settings-";
        private const string roomNamePrefix = "name-";
        private readonly RedisService _redisService;
        private readonly IHubContext<MeetingHub> _meetingHub;

        public RoomService(RedisService redisService, IHubContext<MeetingHub> meetingHub)
        {
            _redisService = redisService;
            _meetingHub = meetingHub;
        }

        public void CloseRoomAfterTimeExpire(
            double roomExpiry,
            string meetingLink,
            string roomId,
            string meetingId)
        {
            var timer = new Timer(roomExpiry * 60 * 1000);

            timer.Elapsed += async (sender, e) =>
            {
                timer.Stop();
                timer.Dispose();

                await _meetingHub.Clients.Group(roomId).SendAsync("OnRoomClosed", meetingLink);
                await _meetingHub.Clients.Group(meetingId).SendAsync("OnRoomClosed", meetingLink);
                await _redisService.ConnectAsync();
                await _redisService.DeleteKeyAsync(roomId);
                await _redisService.DeleteKeyAsync(roomId + nameof(Poll));
                await _redisService.DeleteKeyAsync(meetingSettingsPrefix + roomId);
                await _redisService.DeleteKeyAsync(roomNamePrefix + roomId);
                await _redisService.RemoveAsync(roomId + nameof(Question));

                var meetingdata = await _redisService.GetAsync<MeetingRedisData>(meetingId);
                if (meetingdata != null)
                {
                    meetingdata.RoomsIds = new List<string>();
                    await _redisService.SetAsync(meetingId, meetingdata);
                }
            };

            timer.Start();
        }
    }
}
