using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class GroupMessage:BaseEntity
    {
        public Guid ContactId { get; set; }
        [Required]
        public string Message { get; set; }
        public bool Attachment { get; set; }
    }
}
