using System;

namespace Whale.DAL.Models.Question
{
    public class Answer
	{
		public Guid QuestionId { get; set; }
		public DateTimeOffset? AnsweredAt { get; set; }
		public string Text { get; set; }
		public UserData Answerer { get; set; }
	}
}
