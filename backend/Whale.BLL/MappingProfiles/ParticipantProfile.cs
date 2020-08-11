using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models;
using Whale.Shared.DTO.Participant;

namespace Whale.BLL.MappingProfiles
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
