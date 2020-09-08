using System;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class User : BaseEntity
    {
        public string FirstName { get; set; }
        public string SecondName { get; set; }
        public DateTimeOffset RegistrationDate { get; set; }
        public string AvatarUrl { get; set; }
        public LinkTypeEnum LinkType { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
    }
}
