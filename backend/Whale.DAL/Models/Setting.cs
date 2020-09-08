using System;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Setting : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; }
        public string Values { get; set; }
    }
}
