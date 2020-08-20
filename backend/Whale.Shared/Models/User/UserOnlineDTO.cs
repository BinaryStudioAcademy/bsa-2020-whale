using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.User
{
    public class UserOnlineDTO
    {
        public Guid Id { get; set; }
        public string ConnectionId { get; set; }
    }
}
