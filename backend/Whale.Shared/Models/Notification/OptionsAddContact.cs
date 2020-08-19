using System;

namespace Whale.API.Models.Notification
{
    public class OptionsAddContact
    {
        public Guid ContactId { get; set; }
        public Guid ContactUserId { get; set; }
    }
}
