using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Meeting
{
    public class UpdateSettingsDTO
    {
        public Guid MeetingId { get; set; }
        public bool IsWhiteboard { get; set; }
        public bool IsPoll { get; set; }
    }
}
