using System;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.Services.Abstract;
using Whale.Shared.Models.DirectMessage;
using Whale.Shared.Services;
using Microsoft.AspNetCore.SignalR.Client;
using Whale.Shared.Providers;

namespace Whale.API.Services
{
    public class ContactChatService : BaseService
    {
        private readonly SignalrService _signalrService;
        private readonly FileStorageProvider _fileStorageProvider;

        public ContactChatService(WhaleDbContext context, IMapper mapper, SignalrService signalrService, FileStorageProvider fileStorageProvider) : base(context, mapper) {
            _signalrService = signalrService;
            _fileStorageProvider = fileStorageProvider;
        }
        public async Task<ICollection<DirectMessage>> GetAllContactsMessagesAsync(Guid contactId)
        {
            var messages = _context.DirectMessages
                .Include(msg=>msg.Author)
                .OrderBy(msg=>msg.CreatedAt)
                .Where(p => p.ContactId == contactId) // Filter here
                .AsParallel()
                .Select(msg =>
                {
                    msg.Author.AvatarUrl = msg.Author.LinkType == LinkTypeEnum.Internal ?  _fileStorageProvider.GetImageByNameAsync(msg.Author.AvatarUrl).Result : msg.Author.AvatarUrl;
                    return msg;
                })
                .ToList();
            if (messages == null) throw new Exception("No messages");
            return _mapper.Map<ICollection<DirectMessage>>(messages);
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
            var createdMessageDTO = _mapper.Map<DirectMessage>(createdMessage);

            createdMessageDTO.Author.AvatarUrl = createdMessageDTO.Author.LinkType == LinkTypeEnum.Internal ? await _fileStorageProvider.GetImageByNameAsync(createdMessageDTO.Author.AvatarUrl) : createdMessageDTO.Author.AvatarUrl;

            var connection = await _signalrService.ConnectHubAsync("chatHub");
            await connection.InvokeAsync("NewMessageReceived", createdMessageDTO);

            createdMessageDTO.Author.AvatarUrl = createdMessageDTO.Author.LinkType == LinkTypeEnum.Internal ? await _fileStorageProvider.GetImageByNameAsync(createdMessageDTO.Author.AvatarUrl) : createdMessageDTO.Author.AvatarUrl;

            return createdMessageDTO;
        }
    }
}
