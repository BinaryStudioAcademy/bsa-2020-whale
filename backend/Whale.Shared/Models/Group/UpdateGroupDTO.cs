using System;

namespace Whale.Shared.Models.Group
{
    public class UpdateGroupDTO
    {
        public Guid Id { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }
        public string CreatorEmail { get; set; }
        public string PhotoUrl { get; set; }
    }
}
