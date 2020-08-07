using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models;
using Whale.Shared.DTO.Meeting;

namespace Whale.BLL.MappingProfiles
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
