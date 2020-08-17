﻿using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Poll
{
    public class OptionResult : BaseEntity
    {
        public Guid PollResultId { get; set; }
        public string Option { get; set; }
        public int VoteCount { get; set; }
        public List<Voter> VotedUsers { get; set; } = new List<Voter>();
    }
}