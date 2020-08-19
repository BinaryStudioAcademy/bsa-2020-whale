using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.Models.Participant;

namespace Whale.Shared.MappingProfiles
{
    public class ParticipantProfile: Profile
    {
        public ParticipantProfile()
        {
            CreateMap<ParticipantCreateDTO, Participant>();
            CreateMap<ParticipantUpdateDTO, Participant>();
            CreateMap<Participant, ParticipantDTO>();
        }
    }
}
