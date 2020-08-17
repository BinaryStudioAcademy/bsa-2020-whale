using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Meeting
{
    public class CanvasEvent
    {
        public decimal X { get; set; }
        public decimal Y { get; set; }
        public int Type { get; set; }
        public Guid Uuid { get; set; }
        public DrawingShapes? SelectedShape { get; set; }
        public ShapeOptions SelectedShapeOptions { get; set; }
    }
}
