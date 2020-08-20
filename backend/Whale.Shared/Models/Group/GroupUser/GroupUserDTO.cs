using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.Models.User;

namespace Whale.Shared.DTO.Group.GroupUser
{
    public class GroupUserDTO
    {
            public Guid Id { get; set; }
            public Guid UserId { get; set; }
            public UserDTO User { get; set; }
            public Guid GroupId { get; set; }
            public GroupDTO Group { get; set; }
    }
}
