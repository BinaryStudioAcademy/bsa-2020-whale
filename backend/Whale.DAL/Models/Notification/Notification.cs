using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Notification : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public NotificationTypeEnum NotificationType { get; set; }
        public string Options { get; set; }
    }
}
