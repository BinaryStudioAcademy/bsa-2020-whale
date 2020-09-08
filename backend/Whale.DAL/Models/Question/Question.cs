using System;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Question
{
    public class Question: BaseEntity
	{
		public Guid MeetingId { get; set; }
		public DateTimeOffset AskedAt { get; set; }
		public bool IsAnonymous { get; set; }
		public UserData Asker { get; set; }
		public string Text { get; set; }
		public QuestionStatus QuestionStatus { get; set; }
	}
}
