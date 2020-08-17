using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Mail;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class DirectMessage : BaseEntity
    {
        public Guid ContactId { get; set; }
        public Contact Contact { get; set; }
        public Guid AuthorId { get; set; }
        public User Author { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        [Required]
        public string Message { get; set; }
        public bool Attachment { get; set; }
    }
}
