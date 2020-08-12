using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Poll
{
	public class PollAnswer: BaseEntity
	{
		public Guid PollId { get; set; }
		public string AnswerText { get; set; }
	}
}
