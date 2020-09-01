using System;
using Whale.Shared.Models.Group;
using Whale.Shared.Models.User;

namespace Whale.Shared.Models.GroupMessage
{
    public class GroupMessageDTO
    {
        public Guid Id { get; set; }
        public Guid GroupId { get; set; }
        public GroupDTO Group { get; set; }
        public Guid AuthorId { get; set; }
        public UserDTO Author { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public string Message { get; set; }
        public bool Attachment { get; set; }
    }
}
