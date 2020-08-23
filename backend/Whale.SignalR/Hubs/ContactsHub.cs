using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Whale.DAL.Models;
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
        }
        [HubMethodName("onDeleteContact")]
        public async Task DeleteContacts(Contact contact)
        {
            await Clients.Group(contact.FirstMember.Email).SendAsync("onDeleteContact", contact.Id);
            await Clients.Group(contact.SecondMember.Email).SendAsync("onDeleteContact", contact.Id);
        }

        public async Task Disconnect(string email)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, email);
        }

    }
}