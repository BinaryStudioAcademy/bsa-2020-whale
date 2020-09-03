using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.Shared.Models
{
    public class AgendaPointDTO
    {
        public Guid MeetingId { get; set; }
        public string Name { get; set; }
        public DateTime StartTime { get; set; }
    }
}
