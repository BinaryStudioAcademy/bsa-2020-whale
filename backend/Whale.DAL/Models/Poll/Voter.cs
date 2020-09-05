using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Poll
{
    public class Voter : BaseEntity
	{
		public string FirstName { get; set; }
		public string SecondName { get; set; }
		public string Email { get; set; }
		public string AvatarUrl { get; set; }
	}
}
