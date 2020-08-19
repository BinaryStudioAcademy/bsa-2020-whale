using Whale.Shared.Models.Contact;
using Whale.Shared.Models.Meeting;

namespace Whale.SignalR.Models.Call
{
    public class CallDTO
    {
        public MeetingLinkDTO MeetingLink { get; set; }
        public ContactDTO Contact { get; set; }
        public string CallerEmail { get; set; }
    }
}
