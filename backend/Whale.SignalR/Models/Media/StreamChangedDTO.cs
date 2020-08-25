﻿namespace Whale.SignalR.Models.Media
{
    public class StreamChangedDTO
    {
        public string OldStreamId { get; set; }
        public string NewStreamId { get; set; }
        public bool isVideoActive {get; set; }
        public bool isAudioActive { get; set; }
    }
}