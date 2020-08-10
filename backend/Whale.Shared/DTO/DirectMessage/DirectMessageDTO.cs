using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.Contact;

namespace Whale.Shared.DTO.DirectMessage
{
    public class DirectMessageDTO
    {
        public Guid ContactId { get; set; }
        public ContactDTO Contact { get; set; }
        public string Message { get; set; }
        public bool Attachment { get; set; }
    }
}
