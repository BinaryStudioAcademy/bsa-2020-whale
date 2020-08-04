using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class UserAchivement:BaseEntity
    {
        public int Progress { get; set; }
        public Guid AchivementId { get; set; }
        public Guid UserId { get; set; }
    }
}
