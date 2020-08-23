using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.Group;
using Whale.Shared.Models.Contact;
using Whale.Shared.Models.User;

namespace Whale.Shared.DTO.GroupMessage
{
    public class GroupMessageDTO
    {
        public Guid GroupId { get; set; }
        public GroupDTO Group { get; set; }
        public Guid AuthorId { get; set; }
        public UserDTO Author { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public string Message { get; set; }
        public bool Attachment { get; set; }
    }
}
