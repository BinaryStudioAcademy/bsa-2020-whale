using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Models;

namespace Whale.SignalR.Models.Agenda
{
    public class AgendaSignal
    {
        public string MeetingId { get; set; }
        public AgendaPointDTO Point { get; set; }
    }
}
