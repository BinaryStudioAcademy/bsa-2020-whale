using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Question
{
	public class UserDataDTO
	{
		public Guid UserId { get; set; }
		public string FirstName { get; set; }
		public string SecondName { get; set; }
		public string AvatarUrl { get; set; }
	}
}
