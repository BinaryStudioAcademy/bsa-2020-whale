﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Whale.Shared.DTO.Meeting;
using Whale.Shared.DTO.Meeting.MeetingMessage;

namespace Whale.BLL.Interfaces
{
    public interface IMeetingService
    {
        Task<MeetingLinkDTO> CreateMeeting(MeetingCreateDTO meetingDto, string userEmail);

        Task<MeetingDTO> ConnectToMeeting(MeetingLinkDTO link, string userEmail);

        Task<MeetingMessageDTO> SendMessage(MeetingMessageCreateDTO msgDTO);

        Task<IEnumerable<MeetingMessageDTO>> GetMessagesAsync(string groupName, string userEmail);

        Task<bool> ParticipantDisconnect(string groupname, string userEmail);

        Task<string> GetShortInviteLink(string fullURL);

        Task<string> GetFullInviteLink(string shortURL);
    }
}
