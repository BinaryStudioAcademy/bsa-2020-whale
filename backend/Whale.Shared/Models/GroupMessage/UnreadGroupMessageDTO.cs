﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.GroupMessage
{
    public class UnreadGroupMessageDTO
    {
        public Guid MessageId { get; set; }
        public Guid GroupId { get; set; }
        public Guid ReceiverId { get; set; }
    }
}
