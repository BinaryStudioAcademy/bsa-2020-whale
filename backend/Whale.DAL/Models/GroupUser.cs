using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class GroupUser:BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid GroupId { get; set; }
    }
}
