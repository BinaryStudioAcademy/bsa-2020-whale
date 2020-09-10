using System;

namespace Whale.Shared.Models.DirectMessage
{
    public class DirectMessageCreateDTO
    {
        public Guid ContactId { get; set; }
        public Guid AuthorId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public string Message { get; set; }
        public bool Attachment { get; set; }
        public string AttachmentUrl { get; set; }
    }
}
