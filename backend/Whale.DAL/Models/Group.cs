using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Group:BaseEntity
    {
        public string Label { get; set; }
        public string Description { get; set; }
        public Guid PinnedMessageId { get; set; }
        public GroupMessage PinnedMessage { get; set; }
    }
}
