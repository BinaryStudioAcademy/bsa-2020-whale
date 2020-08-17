using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Meeting
{
    public class CreateDrawingDTO
    {
        public string MeetingId { get; set; }
        public CanvasEvent[] CanvasEvent { get; set; }
    }
}