using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Group.GroupUser
{
    public class DeleteUserFromGroupDTO
    {
        public Guid GroupId { get; set; }
        public string UserEmail { get; set; }
    }

}
