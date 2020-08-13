using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.Meeting;

namespace Whale.Shared.DTO.Call
{
    public class StartCallDTO
    {
        public Guid ContactId { get; set; }
        public MeetingCreateDTO Meeting { get; set; }
        public string Email { get; set; }

    }
}
