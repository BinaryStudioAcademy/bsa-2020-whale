using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Question
{
	public class QuestionCreateDTO
	{
		public Guid MeetingId { get; set; }
		public bool IsAnonymous { get; set; }
		public UserDataDTO Asker { get; set; }
		public string Text { get; set; }
	}
}
