using System;
using System.Collections.Generic;

namespace Whale.Shared.Models.Poll
{
	public class OptionResultDTO
	{
		public string Option { get; set; }
		public IEnumerable<Guid> VotedUserIds { get; set; }
	}
}
