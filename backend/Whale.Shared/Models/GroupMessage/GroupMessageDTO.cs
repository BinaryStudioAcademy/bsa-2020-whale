﻿using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.Models.Contact;

namespace Whale.Shared.DTO.GroupMessage
{
    public class GroupMessageDTO
    {
        public Guid Id { get; set; }
        public Guid ContactId { get; set; }
        public ContactDTO Contact { get; set; }
        public string Message { get; set; }
        public bool Attachment { get; set; }
    }
}
