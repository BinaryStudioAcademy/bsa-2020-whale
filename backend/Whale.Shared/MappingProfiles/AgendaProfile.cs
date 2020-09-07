using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.Models;

namespace Whale.Shared.MappingProfiles
{
    public class AgendaProfile : Profile
    {
        public AgendaProfile()
        {
            CreateMap<AgendaPoint, AgendaPointDTO>();
            CreateMap<AgendaPointDTO, AgendaPoint>();
        }
    }
}
