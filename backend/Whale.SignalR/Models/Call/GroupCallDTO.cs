using Whale.Shared.Models.Group;
using Whale.Shared.Models.Meeting;

namespace Whale.SignalR.Models.Call
{
    public class GroupCallDTO
    {
        public MeetingLinkDTO MeetingLink { get; set; }
        public GroupDTO Group { get; set; }
        public string CallerEmail { get; set; }
    }
}
