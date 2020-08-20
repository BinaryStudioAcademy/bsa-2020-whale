using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models;
using Whale.Shared.DTO.Group; 

namespace Whale.Shared.MappingProfiles
{
    public class GroupProfile: Profile
    {
        public GroupProfile()
        {
            CreateMap<GroupCreateDTO, Group>();
            CreateMap<Group, GroupDTO>().ReverseMap();
        }
    }
}
