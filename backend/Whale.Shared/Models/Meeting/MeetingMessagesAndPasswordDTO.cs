using System.Collections.Generic;
using Whale.Shared.Models.Meeting.MeetingMessage;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingMessagesAndPasswordDTO
    {
        public MeetingMessagesAndPasswordDTO()
        {
            Messages = new List<MeetingMessageDTO>();
        }
        public string Password { get; set; }
        public bool IsRoom { get; set; } = false;

        public ICollection<MeetingMessageDTO> Messages { get; }
    }
}
