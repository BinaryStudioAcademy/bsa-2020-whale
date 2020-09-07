using System.Collections.Generic;
using Whale.Shared.Models.Meeting.MeetingMessage;
using Whale.Shared.Models.Participant;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingRedisData
    {
        public string MeetingId { get; set; }
        public string Password { get; set; }
        public bool IsRoom { get; set; } = false;

        public ICollection<string> RoomsIds { get; set; } = new List<string>();

        public ICollection<ParticipantDTO> Participants { get; set; } = new List<ParticipantDTO>();

        public ICollection<MeetingMessageDTO> Messages { get; } = new List<MeetingMessageDTO>();
    }
}
