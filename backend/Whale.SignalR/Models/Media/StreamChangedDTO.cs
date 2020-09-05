using System;

namespace Whale.SignalR.Models.Media
{
    public class StreamChangedDTO
    {
        public Guid MeetingId { get; set; }
        public string OldStreamId { get; set; }
        public string NewStreamId { get; set; }
        public bool IsVideoActive {get; set; }
        public bool IsAudioActive { get; set; }
    }
}
