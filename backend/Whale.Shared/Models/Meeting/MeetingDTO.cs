using System;
using System.Collections.Generic;
using Whale.Shared.Jobs;
using Whale.Shared.Models.Participant;
using Whale.Shared.Models.Poll;


namespace Whale.Shared.Models.Meeting
{
    public class MeetingDTO
    {
        public Guid Id { get; set; }
        public string Topic { get; set; }
        public string Description { get; set; }
        public string Settings { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset? EndTime { get; set; }
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
        public long SpeechDuration { get; set; }
        public long PresenceDuration { get; set; }
        public string SelectMusic { get; set; }
        public string MeetingType { get; set; }

        public IEnumerable<ParticipantDTO> Participants { get; set; }
        public IEnumerable<PollResultDTO> PollResults { get; set; }
    }
}
