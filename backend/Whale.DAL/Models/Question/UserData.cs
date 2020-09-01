using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Question
{
	public class UserData
	{
		public Guid UserId { get; set; }
		public string FirstName { get; set; }
		public string SecondName { get; set; }
		public string AvatarUrl { get; set; }
	}
}
