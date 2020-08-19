using Microsoft.AspNetCore.SignalR.Client;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Whale.Shared.Services
{
    public class SignalrService
    {
        private readonly string _baseUrl;

        public SignalrService(string baseUrl)
        {
            _baseUrl = baseUrl;
        }

        public async Task<HubConnection> ConnectHubAsync(string hubName)
        {
            var connection = new HubConnectionBuilder()
                .WithUrl($"{_baseUrl}/{hubName}")
                .WithAutomaticReconnect()
                .Build();

            await connection.StartAsync();
            return connection;
        }
    }
}
