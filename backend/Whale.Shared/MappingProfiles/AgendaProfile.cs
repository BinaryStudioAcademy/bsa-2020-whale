using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models;
using Whale.Shared.Models;

namespace Whale.Shared.MappingProfiles
{
    public class AgendaProfile: Profile
    {
        public AgendaProfile()
        {
            CreateMap<AgendaPoint, AgendaPointDTO>();
            CreateMap<AgendaPointDTO, AgendaPoint>();
        }
    }
}
