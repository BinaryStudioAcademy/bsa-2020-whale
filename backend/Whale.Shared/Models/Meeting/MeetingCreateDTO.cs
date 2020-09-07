using System;
using System.Collections.Generic;
using Whale.Shared.Jobs;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingCreateDTO
    {
        public string Settings { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public int AnonymousCount { get; set; }
        public bool IsScheduled { get; set; }
        public bool IsRecurrent { get; set; }
        public JobRecurrenceEnum Recurrence { get; set; }
        public bool IsVideoAllowed { get; set; }
        public bool IsAudioAllowed { get; set; }
        public bool IsWhiteboard { get; set; }
        public bool IsPoll { get; set; }
        public bool IsAllowedToChooseRoom { get; set; }
        public string RecognitionLanguage { get; set; }
        public string CreatorEmail { get; set; }
        public List<string> ParticipantsEmails { get; set; }
        public List<AgendaPointDTO> AgendaPoints { get; set; }
    }
}
