﻿using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class AgendaPoint: BaseEntity
    {
        public Guid MeetingId { get; set; }
        public string Name { get; set; }
        public DateTime StartTime { get; set; }
    }
}
