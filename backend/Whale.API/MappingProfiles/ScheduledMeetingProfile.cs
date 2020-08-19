using AutoMapper;
using Whale.API.Models.ScheduledMeeting;
using Whale.DAL.Models;

namespace Whale.API.MappingProfiles
{
    public class ScheduledMeetingProfile : Profile
    {
        public ScheduledMeetingProfile()
        {
            CreateMap<Meeting, ScheduledMeetingDTO>()
                .ForMember(dest => dest.ScheduledTime, opt => opt.MapFrom(src => src.StartTime));
            CreateMap<ScheduledMeetingCreateDTO, Meeting>()
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.ScheduledTime))
                .ForMember(dest => dest.IsScheduled, opt => opt.MapFrom(_ => true))
                .ForMember(dest => dest.IsRecurrent, opt => opt.MapFrom(_ => true));
        }
    }
}
