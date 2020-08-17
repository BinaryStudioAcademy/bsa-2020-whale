using AutoMapper;
using Whale.Shared.Models.Meeting.MeetingMessage;

namespace Whale.Shared.MappingProfiles
{
    public class MeetingMessage : Profile
    {
        public MeetingMessage()
        {
            CreateMap<MeetingMessageCreateDTO, MeetingMessageDTO>();
        }
    }
}
