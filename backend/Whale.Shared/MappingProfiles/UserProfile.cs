using AutoMapper;
using System;
using Whale.DAL.Models;
using Whale.Shared.Models;
using Whale.Shared.Models.User;

namespace Whale.Shared.MappingProfiles
{
    public class UserProfile:Profile
    {
        public UserProfile()
        {
            CreateMap<User, UserDTO>().ReverseMap();
            CreateMap<UserModel, User>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid()))
                .ForMember(dest => dest.RegistrationDate, opt => opt.MapFrom(_ => DateTimeOffset.Now))
                .ForMember(dest => dest.RegistrationDate, opt => opt.MapFrom(_ => DateTimeOffset.Now))
                .ForMember(dest => dest.LinkType, opt => opt.MapFrom(src => src.LinkType))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.PhotoUrl));
        }
    }
}
