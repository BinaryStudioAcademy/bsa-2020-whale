using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Whale.BLL.Hubs
{
	public class WebRtcSignalHub : Hub
	{
		public override async Task OnConnectedAsync()
		{
			// send to client his id
			await this.Clients.Caller.SendAsync("ThisClientConnected", this.Context.ConnectionId);
			// send client id to all other clients so they can signal each other
			await this.Clients.Others.SendAsync("NewClientConnected", this.Context.ConnectionId);
		}

		public override async Task OnDisconnectedAsync(Exception exception)
		{
			// send client id to all other so they remove disconnected client's tracks (?)
			await this.Clients.Others.SendAsync("ClientDisconnected", this.Context.ConnectionId);
		}

		[HubMethodName("SignalOffer")]
		public async Task OnSignalOffer(string receiverConnectionId, object signalInfo)
		{
			// send signal to receiverConnectionId from Context.ConnectionId with signalInfo
			await this.Clients.Client(receiverConnectionId).SendAsync("SignalOffer", Context.ConnectionId, signalInfo);
		}

		[HubMethodName("SignalAnswer")]
		public async Task OnSignalAnswer(string receiverConnectionId, object signalInfo)
		{
			// send signal to receiverConnectionId from Context.ConnectionId with signalInfo
			await this.Clients.Client(receiverConnectionId).SendAsync("SignalAnswer", Context.ConnectionId, signalInfo);
		}

		public async Task connect(string id)
		{
			await Clients.All.SendAsync("connect", id);
		}
	}
}
