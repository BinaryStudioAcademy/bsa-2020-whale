using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.DAL.Models.Poll
{
	class PollResult
	{
		public Guid PollAnswerId { get; set; }
		public Guid UserId { get; set; }
	}
}
