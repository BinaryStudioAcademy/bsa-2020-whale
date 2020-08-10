using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class ContactSetting : BaseEntity
    {
        public Guid ContactId { get; set; }
        public Contact Contact { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public bool IsBloked { get; set; }
        public bool IsMuted { get; set; }
    }
}