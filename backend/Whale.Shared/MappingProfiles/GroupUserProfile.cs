using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.Models.Group.GroupUser;

namespace Whale.Shared.MappingProfiles
{
    public class GroupUserProfile: Profile
    {
        public GroupUserProfile()
        {
            CreateMap<GroupUser, GroupUserDTO>().ReverseMap();
        }
    }
}
