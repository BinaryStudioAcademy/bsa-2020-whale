using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Poll
{
	public class PollAnswerDTO
	{
		public Guid PollId { get; set; }
		public string UserId { get; set; }
		public int[] Answers { get; set; }
	}
}
