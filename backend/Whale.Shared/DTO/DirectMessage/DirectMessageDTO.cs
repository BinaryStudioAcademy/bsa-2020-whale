using System;
using Whale.Shared.DTO.Contact;
using Whale.Shared.DTO.User;

namespace Whale.Shared.DTO.DirectMessage
{
    public class DirectMessageDTO
    {
        public Guid ContactId { get; set; }
        public ContactDTO Contact { get; set; }
        public Guid AuthorId { get; set; }
        public UserDTO Author { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Message { get; set; }
        public bool Attachment { get; set; }



    }
}
