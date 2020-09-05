using System;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Record : BaseEntity
    {
        public Guid MeetingId { get; set; }
        public Meeting Meeting { get; set; }
        public string Source { get; set; }
        public RecordType Type { get; set; }
    }
}
