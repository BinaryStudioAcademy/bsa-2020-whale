using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Group
{
    public class GroupCreateDTO
    {
        public string Label { get; set; }
        public string Description { get; set; }
        public string CreatorEmail { get; set; }
        public string PhotoUrl { get; set; }
    }
}
