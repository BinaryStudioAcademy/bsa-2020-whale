using System.Collections.Generic;
using Whale.Shared.Models.Meeting.MeetingMessage;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingMessagesAndPasswordDTO
    {
        public string MeetingId { get; set; }
        public string Password { get; set; }
        public bool IsRoom { get; set; } = false;

        public ICollection<string> RoomsIds { get; set; } = new List<string>();

        public ICollection<MeetingMessageDTO> Messages { get; } = new List<MeetingMessageDTO>();
    }
}
