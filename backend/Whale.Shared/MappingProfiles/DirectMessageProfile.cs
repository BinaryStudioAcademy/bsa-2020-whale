using Whale.DAL.Models;
using AutoMapper;
using Whale.Shared.Models.DirectMessage;

namespace Whale.Shared.MappingProfiles
{
    public class DirectMessageProfile : Profile
    {
        public DirectMessageProfile()
        {
            CreateMap<DirectMessageCreateDTO, DirectMessage>().ReverseMap();
            CreateMap<DirectMessage, DirectMessageCreateDTO>().ReverseMap();
        }
    }
}
