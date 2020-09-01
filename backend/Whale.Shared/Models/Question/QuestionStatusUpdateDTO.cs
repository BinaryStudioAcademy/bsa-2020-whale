using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models.Question;

namespace Whale.Shared.Models.Question
{
	public class QuestionStatusUpdateDTO
	{
		public Guid MeetingId { get; set; }
		public Guid QuestionId { get; set; }
		public QuestionStatus QuestionStatus { get; set; }
	}
}
