﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Meeting.MeetingMessage
{
    public class MeetingMessageCreateDTO
    {
        public string AuthorEmail { get; set; }
        public string MeetingId { get; set; }
        public string Message { get; set; }
        public string ReceiverEmail { get; set; }
    }
}
