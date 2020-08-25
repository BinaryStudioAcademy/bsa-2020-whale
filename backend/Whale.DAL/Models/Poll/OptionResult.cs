using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Poll
{
    public class OptionResult
    {
        public string Option { get; set; }
        public IEnumerable<Guid> VotedUserIds { get; set; } = new List<Guid>();
    }
}
