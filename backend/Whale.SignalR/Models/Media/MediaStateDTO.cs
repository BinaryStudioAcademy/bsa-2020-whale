namespace Whale.SignalR.Models.Media
{
    public class MediaStateDTO
    {
        public string StreamId { get; set; }
        public string ReceiverConnectionId {get; set; }
        public bool IsVideoActive { get; set; }
        public bool IsAudioActive { get; set; }
    }
}
