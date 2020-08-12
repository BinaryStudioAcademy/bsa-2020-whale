using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Poll
{
    public class Poll : BaseEntity
    {
        public Guid MeetingId { get; set; }
        public Meeting Meeting { get; set; }
        public string Title { get; set; }
        public bool IsAnonymous { get; set; }
        public bool IsSingleChoice { get; set; }

        public ICollection<string> Answers { get; set; }

        //[Required]
        //public string Answer1 { get; set; }
        //[Required]
        //public string Answer2 { get; set; }
        //public string Answer3 { get; set; }
        //public string Answer4 { get; set; }
        //public string Answer5 { get; set; }
    }
}
