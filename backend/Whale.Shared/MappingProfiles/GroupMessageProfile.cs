using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.Models.GroupMessage;

namespace Whale.Shared.MappingProfiles
{
    public class GroupMessageProfile: Profile
    {
        public GroupMessageProfile()
        {
            CreateMap<GroupMessage, GroupMessageDTO>().ReverseMap();
            CreateMap<GroupMessageCreateDTO, GroupMessage>().ReverseMap();
        }
    }
}
