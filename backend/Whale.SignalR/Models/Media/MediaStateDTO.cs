using System;

namespace Whale.SignalR.Models.Media
{
    public class MediaStateDTO
    {
        public Guid MeetingId { get; set; }
        public string StreamId { get; set; }
        public string ReceiverConnectionId {get; set; }
        public bool IsVideoAllowed { get; set; }
        public bool IsAudioAllowed { get; set; }
        public bool IsVideoActive { get; set; }
        public bool IsAudioActive { get; set; }
    }
}
