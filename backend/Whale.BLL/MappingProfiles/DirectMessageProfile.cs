using System;
using Whale.DAL.Models;
using AutoMapper;
using Whale.Shared.DTO.DirectMessage;

namespace Whale.BLL.MappingProfiles
{
    public class DirectMessageProfile : Profile
    {
        public DirectMessageProfile()
        {
            CreateMap<DirectMessage, DirectMessageDTO>().ReverseMap();
            CreateMap<DirectMessage, DirectMessageCreateDTO>().ReverseMap();
        }
    }
}
