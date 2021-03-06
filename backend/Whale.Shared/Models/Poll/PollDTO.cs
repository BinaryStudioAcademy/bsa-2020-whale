﻿using System;
using System.Collections.Generic;
using Whale.DAL.Models.Poll;

namespace Whale.Shared.Models.Poll
{
	public class PollDTO
	{
        public Guid Id { get; set; }
		public Guid MeetingId { get; set; }
        public string Title { get; set; }
        public bool IsAnonymous { get; set; }
        public bool IsSingleChoice { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        public string[] Options { get; set; }
    }
}
