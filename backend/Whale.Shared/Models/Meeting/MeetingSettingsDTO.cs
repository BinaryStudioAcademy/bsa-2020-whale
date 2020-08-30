﻿namespace Whale.Shared.Models.Meeting
{
    class MeetingSettingsDTO
    {
        public bool IsVideoAllowed { get; set; }
        public bool IsAudioAllowed { get; set; }
        public bool IsWhiteboard { get; set; }
        public bool IsPoll { get; set; }
    }
}
