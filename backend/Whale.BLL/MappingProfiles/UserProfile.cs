using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.DTO.User;

namespace Whale.BLL.MappingProfiles
{
    public class UserProfile:Profile
    {
        public UserProfile()
        {
            CreateMap<User, UserDTO>().ReverseMap();
        }
    }
}
