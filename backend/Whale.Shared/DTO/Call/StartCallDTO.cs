using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.Meeting;

namespace Whale.Shared.DTO.Call
{
    public class StartCallDTO
    {
        public string ContactId { get; set; }
        public MeetingCreateDTO Meeting { get; set; }
        public List<string> Emails { get; set; }
    }
}
