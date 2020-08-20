using System;
using Whale.DAL.Models;

namespace Whale.Shared.Models.Notification
{
    public class NotificationDTO
    {
        public Guid Id { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public NotificationTypeEnum NotificationType { get; set; }
        public string Options { get; set; }
    }
}
