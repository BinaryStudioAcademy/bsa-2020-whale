using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.Contact;
using Whale.Shared.DTO.Meeting;

namespace Whale.Shared.DTO.Call
{
    public class CallDTO
    {
        public MeetingLinkDTO MeetingLink { get; set; }
        public ContactDTO Contact { get; set; }
    }
}
