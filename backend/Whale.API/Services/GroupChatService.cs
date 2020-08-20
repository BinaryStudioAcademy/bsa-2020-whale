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
using Whale.Shared.DTO.GroupMessage;
using Whale.Shared.Extentions;
using Whale.Shared.Models.GroupMessage;
using Whale.Shared.Services;
using Whale.Shared.Services.Abstract;

namespace Whale.API.Services
{
    public class GroupChatService: BaseService
    {
        private readonly SignalrService _signalrService;
        private readonly BlobStorageSettings _blobStorageSettings;

        public GroupChatService(WhaleDbContext context, IMapper mapper, SignalrService signalrService, BlobStorageSettings blobStorageSettings) : base(context, mapper)
        {
            _signalrService = signalrService;
            _blobStorageSettings = blobStorageSettings;
        }
        public async Task<ICollection<GroupMessage>> GetAllGroupsMessagesAsync(Guid groupId)
        {
            var messages = await _context.GroupMessages
                .Include(msg => msg.Author)
                .OrderBy(msg => msg.CreatedAt)
                .Where(p => p.GroupId == groupId) // Filter here
                .ToListAsync();
            if (messages == null) throw new Exception("No messages");
            return _mapper.Map<ICollection<GroupMessage>>(await messages.LoadAvatarsAsync(_blobStorageSettings, msg => msg.Author));
        }
        public async Task<GroupMessageDTO> CreateGroupMessage(GroupMessageCreateDTO groupMessageDto)
        {
            var messageEntity = _mapper.Map<GroupMessage>(groupMessageDto);
            //messageEntity.CreatedAt = DateTimeOffset.UtcNow;
            _context.GroupMessages.Add(messageEntity);
            await _context.SaveChangesAsync();

            var createdMessage = await _context.GroupMessages
                .Include(msg => msg.Author)
                .FirstAsync(msg => msg.Id == messageEntity.Id);

            await createdMessage.Author.LoadAvatarAsync(_blobStorageSettings);

            var createdMessageDTO = _mapper.Map<GroupMessageDTO>(createdMessage);

            var connection = await _signalrService.ConnectHubAsync("chatHub");
            await connection.InvokeAsync("NewGroupMessageReceived", createdMessageDTO);

            return createdMessageDTO;
        }
    }
}
