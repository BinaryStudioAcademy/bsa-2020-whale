using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;
using Whale.Shared.Services;
using Whale.SignalR.Hubs;

namespace Whale.SignalR.Services
{
    public class RoomService
    {
        private readonly RedisService _redisService;
        private readonly IHubContext<MeetingHub> _meetingHub;

        public RoomService(RedisService redisService, IHubContext<MeetingHub> meetingHub)
        {
            _redisService = redisService;
            _meetingHub = meetingHub;
        }

        public async void CloseRoomAfterTimeExpire(int roomExpiry, string meetingLink, string roomId)
        {
            var timer = new Timer(roomExpiry * 60 * 1000);

            timer.Elapsed += async (sender, e) =>
            {
                timer.Stop();
                timer.Dispose();

                await _redisService.DeleteKey(roomId);
                await _meetingHub.Clients.Group(roomId).SendAsync("OnRoomClosed", meetingLink);
            };

            timer.Start();
        }
    }
}
