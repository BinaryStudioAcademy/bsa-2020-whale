using System;

namespace Whale.Shared.DTO.Contact
{
    public class ContactCreateDTO
    {
        public Guid OwnerId { get; set; }
        public Guid ContactnerId { get; set; }
    }
}
