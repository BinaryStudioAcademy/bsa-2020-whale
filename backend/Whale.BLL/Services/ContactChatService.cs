using System;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.BLL.Hubs;
using Whale.BLL.Services.Abstract;
using Whale.DAL;
using Whale.Shared.DTO.Contact;
using Whale.Shared.DTO.DirectMessage;
using Whale.DAL.Models;
using Whale.BLL.Services.Interfaces;

namespace Whale.BLL.Services
{
    public class ContactChatService : BaseService
    {
        private readonly IHubContext<ChatHub> _chatHub;
        public ContactChatService(WhaleDbContext context, IMapper mapper, IHubContext<ChatHub> chatHub) : base(context, mapper)
        {
            _chatHub = chatHub;
        }
        public async Task<ICollection<DirectMessageDTO>> GetAllContactsMessagesAsync(Guid contactId)
        {
            var messages = await _context.DirectMessages
                .Include(msg=>msg.Author)
                .OrderBy(msg=>msg.CreatedAt)
                .Where(p => p.ContactId == contactId) // Filter here
                .ToListAsync();
            if (messages == null) throw new Exception("No messages");
            return _mapper.Map<ICollection<DirectMessageDTO>>(messages);
        }
        public async Task<DirectMessageDTO> CreateDirectMessage(DirectMessageCreateDTO directMessageDto)
        {
            var messageEntity = _mapper.Map<DirectMessage>(directMessageDto);
            messageEntity.CreatedAt = DateTimeOffset.UtcNow;
            _context.DirectMessages.Add(messageEntity);
            await _context.SaveChangesAsync();

            var createdMessage = await _context.DirectMessages
                .Include(msg => msg.Author)
                .FirstAsync(msg => msg.Id == messageEntity.Id);
            var createdMessageDTO = _mapper.Map<DirectMessageDTO>(createdMessage);
            await _chatHub.Clients.Group(directMessageDto.ContactId.ToString()).SendAsync("NewMessageReceived", createdMessageDTO);

            return createdMessageDTO;
        }
    }
}
