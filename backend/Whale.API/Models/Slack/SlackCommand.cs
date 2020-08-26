namespace Whale.API.Models.Slack
{
    public class SlackCommand
    {
        public string text { get; set; }
        public string channel_id { get; set; }
        public string user_name { get; set; }
        public string token { get; set; }
        public string team_id { get; set; }
        public string team_domain { get; set; }
        public string channel_name { get; set; }
        public string user_id { get; set; }
        public string api_app_id { get; set; }
        public string response_url { get; set; }
        public string trigger_id { get; set; }
        public string command { get; set; }
    }
}
