﻿using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.Models.Group;

namespace Whale.Shared.MappingProfiles
{
    public class GroupProfile: Profile
    {
        public GroupProfile()
        {
            CreateMap<GroupCreateDTO, Group>();
            CreateMap<Group, GroupDTO>().ReverseMap();
            CreateMap<Group, UpdateGroupDTO>().ReverseMap();
            CreateMap<GroupDTO, UpdateGroupDTO>().ReverseMap();
        }
    }
}
