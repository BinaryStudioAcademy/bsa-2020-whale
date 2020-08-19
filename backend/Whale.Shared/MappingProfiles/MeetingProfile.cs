using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.Models.Meeting;

namespace Whale.Shared.MappingProfiles
{
    public class MeetingProfile: Profile
    {
        public MeetingProfile()
        {
            CreateMap<MeetingCreateDTO, Meeting>();
            CreateMap<Meeting, MeetingDTO>();
        }
    }
}
