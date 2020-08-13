using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.Meeting.MeetingMessage;

namespace Whale.Shared.DTO.Meeting
{
    public class MeetingMessagesAndPasswordDTO
    {
        public MeetingMessagesAndPasswordDTO()
        {
            Messages = new List<MeetingMessageDTO>();
        }
        public string Password { get; set; }

        public ICollection<MeetingMessageDTO> Messages { get; }
    }
}
