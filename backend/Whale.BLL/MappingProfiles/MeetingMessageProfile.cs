using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.Meeting.MeetingMessage;

namespace Whale.BLL.MappingProfiles
{
    public class MeetingMessage : Profile
    {
        public MeetingMessage()
        {
            CreateMap<MeetingMessageCreateDTO, MeetingMessageDTO>();
        }
    }
}
