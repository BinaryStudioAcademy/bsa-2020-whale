using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Question
{
	public class AnswerDTO
	{
		public Guid MeetingId { get; set; }
		public Guid QuestionId { get; set; }
		public string Text { get; set; }
		public UserDataDTO Answerer { get; set; }
	}
}
