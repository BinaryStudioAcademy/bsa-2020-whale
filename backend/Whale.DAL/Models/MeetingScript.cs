using System;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class MeetingScript : BaseEntity
	{
		public Guid MeetingId { get; set; }
		public Meeting Meeting { get; set; }
		public string Script { get; set; }
	}
}
