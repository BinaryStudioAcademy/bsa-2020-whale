using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.API.Models.Slack
{
    public class ExternalCommand
    {
        public string text { get; set; }
        public string email { get; set; }
    }
}
