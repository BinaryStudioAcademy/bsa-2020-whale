using System;

namespace Whale.Shared.Models.Poll
{
	public class VoterDTO
	{
		public Guid Id { get; set; }
		public string FirstName { get; set; }
		public string SecondName { get; set; }
		public string Email { get; set; }
		public string AvatarUrl { get; set; }
	}
}
