using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Group.GroupUser
{
    public class GroupUserCreateDTO
    {
        public string UserEmail { get; set; }
        public Guid GroupId { get; set; }
    }
}
