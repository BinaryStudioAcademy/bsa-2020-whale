using Whale.Shared.Models.Participant;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingConnectDTO
    {
        public string UserEmail { get; set; }
        public string PeerId { get; set; }
        public string StreamId { get; set; }
        public string MeetingId { get; set; }
        public string MeetingPwd { get; set; }
        public ParticipantDTO Participant { get; set; }
    }
}
