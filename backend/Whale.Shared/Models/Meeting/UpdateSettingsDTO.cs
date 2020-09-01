using System;

namespace Whale.Shared.Models.Meeting
{
    public class UpdateSettingsDTO
    {
        public Guid MeetingId { get; set; }
        public string ApplicantEmail { get; set; }
        public bool IsWhiteboard { get; set; }
        public bool IsPoll { get; set; }
        public bool IsAudioDisabled { get; set; }
        public bool IsVideoDisabled { get; set; }
    }
}
