using AutoMapper;
using System;
using System.Linq;
using Whale.DAL.Models;
using Whale.Shared.DTO.User;
using Whale.Shared.Models;

namespace Whale.BLL.MappingProfiles
{
    public class UserProfile:Profile
    {
        public UserProfile()
        {
            CreateMap<User, UserDTO>().ReverseMap();
            CreateMap<UserModel, User>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.RegistrationDate, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.RegistrationDate, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.PhotoUrl));
        }
    }
}
