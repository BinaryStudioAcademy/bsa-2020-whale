using System;

namespace Whale.Shared.Models.User
{
    public class UserOnlineDTO
    {
        public Guid Id { get; set; }
        public string ConnectionId { get; set; }
        public bool IsSpeaking { get; set; }
    }
}
