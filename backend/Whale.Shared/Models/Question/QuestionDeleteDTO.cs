using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Question
{
	public class QuestionDeleteDTO
	{
		public Guid MeetingId { get; set; }
		public Guid QuestionId { get; set; } 
	}
}
