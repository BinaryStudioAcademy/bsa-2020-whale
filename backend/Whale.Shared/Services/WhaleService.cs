using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Whale.Shared.Models.User;

namespace Whale.Shared.Services
{
    public class WhaleService
    {
        private readonly UserService _userService;
        private readonly RedisService _redisService;
        public static string OnlineUsersKey { get; } = "online";

        public WhaleService(UserService userService, RedisService redisService)
        {
            _userService = userService;
            _redisService = redisService;
        }

        public async Task<UserOnlineDTO> UserConnect(string userEmail, string connectionId)
        {
            await _redisService.ConnectAsync();
            ICollection<UserOnlineDTO> onlineUsers;
            try
            {
                onlineUsers = await _redisService.GetAsync<ICollection<UserOnlineDTO>>(OnlineUsersKey);
            }
            catch (Exception)
            {
                onlineUsers = new List<UserOnlineDTO>();
            }
            var user = await _userService.GetUserByEmail(userEmail);
            onlineUsers = onlineUsers?.Where(u => u.Id != user.Id).ToList() ?? new List<UserOnlineDTO>(); //TODO: Fix it 
            var newUserOnline = new UserOnlineDTO { Id = user.Id, ConnectionId = connectionId };
            onlineUsers.Add(newUserOnline);
            await _redisService.SetAsync(OnlineUsersKey, onlineUsers);
            return newUserOnline;
        }

        public async Task UserDisconnect(string userEmail)
        {
            await _redisService.ConnectAsync();
            var onlineUsers = await _redisService.GetAsync<ICollection<UserOnlineDTO>>(OnlineUsersKey);
            var user = await _userService.GetUserByEmail(userEmail);
            onlineUsers = onlineUsers.Where(u => u.Id != user.Id).ToList();

            await _redisService.SetAsync(OnlineUsersKey, onlineUsers);
        }

        public async Task<Guid> UserDisconnectOnError(string connectionId)
        {
            await _redisService.ConnectAsync();
            var onlineUsers = _redisService.Get<ICollection<UserOnlineDTO>>(OnlineUsersKey);
            var onlineUser = onlineUsers.FirstOrDefault(u => u.ConnectionId == connectionId);
            var onlineUserConnections = onlineUsers.Where(u => u.Id == onlineUser?.Id).ToList();
            foreach (var ou in onlineUserConnections)
            {
                onlineUsers.Remove(ou);
            }
            if (onlineUsers.Count == 0)
            {
                await _redisService.DeleteKey(OnlineUsersKey);
            }
            else
            {
                await _redisService.SetAsync(OnlineUsersKey, onlineUsers);
            }
            return onlineUser?.Id ?? Guid.NewGuid(); //TODO: Fix it
        }

        public async Task<IEnumerable<string>> GetConnections(Guid receiverId)
        {
            await _redisService.ConnectAsync();
            var onlineUsers = _redisService.Get<ICollection<UserOnlineDTO>>(OnlineUsersKey);
            return onlineUsers.Where(u => u.Id == receiverId).Select(u => u.ConnectionId);
        }
    }
}
