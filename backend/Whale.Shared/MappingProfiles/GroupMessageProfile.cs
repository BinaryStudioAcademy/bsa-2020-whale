using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models;
using Whale.Shared.DTO.GroupMessage;

namespace Whale.BLL.MappingProfiles
{
    public class GroupMessageProfile: Profile
    {
        public GroupMessageProfile()
        {
            CreateMap<GroupMessage, GroupMessageDTO>().ReverseMap();
        }
    }
}
