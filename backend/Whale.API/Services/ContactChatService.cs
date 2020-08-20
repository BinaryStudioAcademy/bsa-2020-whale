using AutoMapper;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Settings;
using Whale.Shared.Extentions;
using Whale.Shared.Models.DirectMessage;
using Whale.Shared.Services;
using Whale.Shared.Services.Abstract;

namespace Whale.API.Services
{
    public class ContactChatService : BaseService
    {
        private readonly SignalrService _signalrService;
        private readonly BlobStorageSettings _blobStorageSettings;

        public ContactChatService(WhaleDbContext context, IMapper mapper, SignalrService signalrService, BlobStorageSettings blobStorageSettings) : base(context, mapper)
        {
            _signalrService = signalrService;
            _blobStorageSettings = blobStorageSettings;
        }
        public async Task<ICollection<DirectMessage>> GetAllContactsMessagesAsync(Guid contactId)
        {
            var messages = await _context.DirectMessages
                .Include(msg => msg.Author)
                .OrderBy(msg => msg.CreatedAt)
                .Where(p => p.ContactId == contactId) // Filter here
                .ToListAsync();
            if (messages == null) throw new Exception("No messages");
            return _mapper.Map<ICollection<DirectMessage>>(await messages.LoadAvatars(_blobStorageSettings, msg => msg.Author));
        }
        public async Task<DirectMessage> CreateDirectMessage(DirectMessageCreateDTO directMessageDto)
        {
            var messageEntity = _mapper.Map<DirectMessage>(directMessageDto);
            messageEntity.CreatedAt = DateTimeOffset.UtcNow;
            _context.DirectMessages.Add(messageEntity);
            await _context.SaveChangesAsync();

            var createdMessage = await _context.DirectMessages
                .Include(msg => msg.Author)
                .FirstAsync(msg => msg.Id == messageEntity.Id);

            await createdMessage.Author.LoadAvatarAsync(_blobStorageSettings);

            var createdMessageDTO = _mapper.Map<DirectMessage>(createdMessage);

            var connection = await _signalrService.ConnectHubAsync("chatHub");
            await connection.InvokeAsync("NewMessageReceived", createdMessageDTO);

            return createdMessageDTO;
        }
    }
}
