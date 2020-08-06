using System;
using Whale.Shared.DTO.User;

namespace Whale.Shared.DTO.Contact
{
    public class ContactDTO
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public UserDTO Owner { get; set; }
        public Guid ContactnerId { get; set; }
        public UserDTO Contactner { get; set; }
        public bool IsBlocked { get; set; }
    }
}
