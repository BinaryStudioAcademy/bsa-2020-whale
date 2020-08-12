using System;
using Whale.Shared.DTO.Contact;
using System.Text;

namespace Whale.Shared.DTO.DirectMessage
{
    public class DirectMessageCreateDTO
    {
        public Guid ContactId { get; set; }
        public Guid AuthorId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Message { get; set; }
        public bool Attachment { get; set; }
    }
}
