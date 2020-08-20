using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Whale.Shared.Models.Contact;
using Whale.Shared.Models.DirectMessage;
using Whale.Shared.Models.Notification;
using Whale.Shared.Services;
using Whale.SignalR.Models.Call;

namespace Whale.SignalR.Hubs
{
    public sealed class ContactsHub : Hub
    {

        [HubMethodName("onConect")]
        public async Task Join(string email)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, email);
        }

        [HubMethodName("onNewContact")]
        public async Task SendContacts(ContactDTO contactDTO)
        {
            await Clients.Group(contactDTO.FirstMember.Email).SendAsync("onNewContact", contactDTO);
            await Clients.Group(contactDTO.SecondMember.Email).SendAsync("onNewContact", contactDTO);
        }

        public async Task Disconnect(string email)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, email);
        }

    }
}