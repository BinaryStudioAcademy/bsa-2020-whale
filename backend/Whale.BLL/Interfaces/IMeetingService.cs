using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Whale.Shared.DTO.Meeting;
using Whale.Shared.DTO.Meeting.MeetingMessage;

namespace Whale.BLL.Interfaces
{
    public interface IMeetingService
    {
        Task<MeetingLinkDTO> CreateMeeting(MeetingCreateDTO meetingDto);

        Task<MeetingDTO> ConnectToMeeting(MeetingLinkDTO link);

        MeetingMessageDTO SendMessage(MeetingMessageCreateDTO msgDTO);

        IEnumerable<MeetingMessageDTO> GetMessages(string groupName);
    }
}
