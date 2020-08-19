using System;
using Whale.Shared.Models.Contact;
using Whale.Shared.Models.User;

namespace Whale.Shared.Models.DirectMessage
{
    public class DirectMessageDTO
    {
        public Guid Id { get; set; }
        public Guid ContactId { get; set; }
        public ContactDTO Contact { get; set; }
        public Guid AuthorId { get; set; }
        public UserDTO Author { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public string Message { get; set; }
        public bool Attachment { get; set; }
    }
}
