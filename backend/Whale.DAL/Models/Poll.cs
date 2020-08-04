using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Poll:BaseEntity
    {
        public Guid MeetingId { get; set; }
        public string Title { get; set; }
        public bool IsAnonymous { get; set; }
        public bool IsSingleChoice { get; set; }
        public string Answer1 { get; set; }
        public string Answer2 { get; set; }
        public string Answer3 { get; set; }
        public string Answer4 { get; set; }
        public string Answer5 { get; set; }
    }
}
