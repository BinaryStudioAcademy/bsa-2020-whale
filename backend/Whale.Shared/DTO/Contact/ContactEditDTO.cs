using System;

namespace Whale.Shared.DTO.Contact
{
    public class ContactEditDTO
    {
        public Guid OwnerId { get; set; }
        public Guid ContactnerId { get; set; }
        public bool IsBlocked { get; set; }
    }
}
