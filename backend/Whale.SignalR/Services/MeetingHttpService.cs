using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Whale.SignalR.Services
{
    public class MeetingHttpService
    {
        private readonly HttpClient _client;
        private readonly string _baseUrl;

        public MeetingHttpService(string baseUrl)
        {
            _client = new HttpClient();
            _baseUrl = baseUrl;
        }

        public async Task DeleteMeetingPolls(string meetingId)
        {
            await _client.GetAsync($"{_baseUrl}/api/polls/saveResults?meetingId={meetingId}");
        }
    }
}
