using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Setting:BaseEntity
    {
        public Guid UserId { get; set; }
        public string Values { get; set; }
    }
}
