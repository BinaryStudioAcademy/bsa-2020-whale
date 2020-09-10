using System;
using System.ComponentModel.DataAnnotations;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class GroupMessage : BaseEntity
    {
        public Guid GroupId { get; set; }
        public Group Group { get; set; }
        public Guid AuthorId { get; set; }
        public User Author { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        [Required]
        public string Message { get; set; }
        public bool Attachment { get; set; }
        public string AttachmentUrl { get; set; }
    }
}
