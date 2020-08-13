using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Call
{
    public class DeclineCallDTO
    {
        public string ContactId { get; set; }
        public string MeetingId { get; set; }
        public string Email { get; set; }
    }
}
