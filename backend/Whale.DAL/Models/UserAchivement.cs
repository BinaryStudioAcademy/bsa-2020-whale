using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class UserAchivement : BaseEntity
    {
        public int Progress { get; set; }
        public Guid AchivementId { get; set; }
        public Achivement Achivement { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
    }
}
