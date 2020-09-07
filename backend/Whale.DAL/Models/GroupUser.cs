using System;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class GroupUser : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; }
        public Guid GroupId { get; set; }
        public Group Group { get; set; }
    }
}
