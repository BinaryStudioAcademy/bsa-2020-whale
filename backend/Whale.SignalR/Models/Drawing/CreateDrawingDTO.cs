namespace Whale.SignalR.Models.Drawing
{
    public class CreateDrawingDTO
    {
        public string MeetingId { get; set; }
        public CanvasEvent[] CanvasEvent { get; set; }
    }
}