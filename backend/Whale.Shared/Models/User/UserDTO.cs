﻿using System;
using Whale.DAL.Models;

namespace Whale.Shared.Models.User
{
    public class UserDTO
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string SecondName { get; set; }
        public DateTimeOffset RegistrationDate { get; set; }
        public string AvatarUrl { get; set; }
        public LinkTypeEnum LinkType { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string ConnectionId { get; set; }
    }
}
