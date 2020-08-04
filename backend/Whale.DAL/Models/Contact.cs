using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Contact:BaseEntity
    {
        public Guid OwnerId { get; set; }
        public User Owner { get; set; }
        public Guid ContactnerId { get; set; }
        public User Contactner { get; set; }
        public bool IsBlocked { get; set; }
    }
}
