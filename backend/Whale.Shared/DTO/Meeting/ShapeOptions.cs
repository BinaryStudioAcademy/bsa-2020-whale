using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Meeting
{
    public class ShapeOptions
    {
        public bool ShouldFillShape { get; set; }
        public string FillStyle { get; set; }
        public string StrokeStyle { get; set; }
        public int LineWidth { get; set; }
        public string LineJoin { get; set; }
        public string LineCap { get; set; }
    }
}
