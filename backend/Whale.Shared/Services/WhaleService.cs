using Microsoft.AspNetCore.SignalR.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Models.User;

namespace Whale.Shared.Services
{
    public class WhaleService
    {
        private readonly UserService _userService;
        private readonly RedisService _redisService;
        private readonly SignalrService _signalrService;
        public static string OnlineUsersKey { get; } = "online";

        public WhaleService(UserService userService, RedisService redisService, SignalrService signalrService)
        {
            _userService = userService;
            _redisService = redisService;
            _signalrService = signalrService;
        }

        public async Task<UserOnlineDTO> UserConnectAsync(string userEmail, string connectionId)
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

            var user = await _userService.GetUserByEmailAsync(userEmail);
            onlineUsers = onlineUsers?.Where(u => u.Id != user.Id).ToList() ?? new List<UserOnlineDTO>(); //TODO: Fix it 
            var newUserOnline = new UserOnlineDTO { Id = user.Id, ConnectionId = connectionId, IsSpeaking = false };
            onlineUsers.Add(newUserOnline);
            await _redisService.SetAsync(OnlineUsersKey, onlineUsers);
            return newUserOnline;
        }

        public async Task UpdateUserState(Guid userId, bool isSpeaking)
        {
            await _redisService.ConnectAsync();
            var onlineUsers = await _redisService.GetAsync<ICollection<UserOnlineDTO>>(OnlineUsersKey);
            foreach(var u in onlineUsers)
            {
                if (u.Id == userId)
                {
                    u.IsSpeaking = isSpeaking;
                }
            }
            await _redisService.SetAsync(OnlineUsersKey, onlineUsers);
            var connection = await _signalrService.ConnectHubAsync("whale");
            var onlineUser = onlineUsers.FirstOrDefault(u => u.Id == userId);
            await connection.InvokeAsync("OnUpdateUserState", onlineUser);
        }

        public async Task UserDisconnectAsync(string userEmail)
        {
            await _redisService.ConnectAsync();
            var onlineUsers = await _redisService.GetAsync<ICollection<UserOnlineDTO>>(OnlineUsersKey);
            var user = await _userService.GetUserByEmailAsync(userEmail);
            onlineUsers = onlineUsers.Where(u => u.Id != user.Id).ToList();

            await _redisService.SetAsync(OnlineUsersKey, onlineUsers);
        }

        public async Task<Guid> UserDisconnectOnErrorAsync(string connectionId)
        {
            await _redisService.ConnectAsync();
            var onlineUsers = _redisService.Get<ICollection<UserOnlineDTO>>(OnlineUsersKey);
            var onlineUser = onlineUsers.FirstOrDefault(u => u.ConnectionId == connectionId);
            foreach (var ou in onlineUsers.Where(u => u.Id == onlineUser?.Id).ToList())
            {
                onlineUsers.Remove(ou);
            }
            if (onlineUsers.Count == 0)
            {
                await _redisService.DeleteKeyAsync(OnlineUsersKey);
            }
            else
            {
                await _redisService.SetAsync(OnlineUsersKey, onlineUsers);
            }
            return onlineUser?.Id ?? Guid.NewGuid(); //TODO: Fix it
        }

        public async Task<IEnumerable<string>> GetConnectionsAsync(Guid receiverId)
        {
            await _redisService.ConnectAsync();
            var onlineUsers = _redisService.Get<ICollection<UserOnlineDTO>>(OnlineUsersKey);
            return onlineUsers.Where(u => u.Id == receiverId).Select(u => u.ConnectionId);
        }
    }
}
