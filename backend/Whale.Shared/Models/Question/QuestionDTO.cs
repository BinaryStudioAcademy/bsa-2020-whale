using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models.Question;

namespace Whale.Shared.Models.Question
{
	public class QuestionDTO
	{
		public Guid Id { get; set; }
		public Guid MeetingId { get; set; }
		public DateTimeOffset AskedAt { get; set; }
		public UserDataDTO Asker { get; set; }
		public string Text { get; set; }
		public QuestionStatus QuestionStatus { get; set; }
	}
}
