using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models;
using Whale.Shared.DTO.Group.GroupUser;

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
