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
using Whale.Shared.Models.GroupMessage;
using Whale.Shared.Extentions;
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
                .Where(p => p.GroupId == groupId) 
                .ToListAsync();
            if (messages == null) throw new Exception("No messages");
            return _mapper.Map<ICollection<GroupMessage>>(await messages.LoadAvatarsAsync(_blobStorageSettings, msg => msg.Author));
        }
        public async Task<GroupMessageDTO> CreateGroupMessage(GroupMessageCreateDTO groupMessageDto)
        {
            var messageEntity = _mapper.Map<GroupMessage>(groupMessageDto);
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

        public async Task<ReadAndUnreadGroupMessages> GetReadAndUnreadAsync(Guid groupId, Guid userId)
        {
            var messagesWithoutAvatars = await _context.GroupMessages
                .Include(msg => msg.Author)
                .Include(msg => msg.Group)
                .OrderBy(msg => msg.CreatedAt)
                .Where(p => p.GroupId == groupId) // Filter here
                .ToListAsync();

            if (messagesWithoutAvatars == null) throw new Exception("No messages");

            var messages = await messagesWithoutAvatars.LoadAvatarsAsync(_blobStorageSettings, msg => msg.Author);
            var receivingMessages = messages.Where(m => m.AuthorId != userId);

            var unreadMessages = receivingMessages.Where(
                m => _context.UnreadGroupMessages.Any(um => um.MessageId == m.Id && um.ReceiverId == userId)
            );

            var readMessages = messages.Except(unreadMessages).ToList();
                
            var readAndUnreadMessages = new ReadAndUnreadGroupMessages
            {
                ReadMessages = _mapper.Map<IEnumerable<GroupMessageDTO>>(readMessages),
                UnreadMessages = _mapper.Map<IEnumerable<GroupMessageDTO>>(unreadMessages)
            };

            return readAndUnreadMessages;
        }
        public async Task AddUnreadGroupMessage(GroupMessage message)
        {
            var group = await _groupService.GetGroupAsync(message.GroupId);

            var groupUsers = await _groupService.GetAllUsersInGroupAsync(message.GroupId);
            var receivers = groupUsers.Where(gu => gu.Email != message.Author.Email);
            foreach (UserDTO u in receivers)
            {
                await _context.UnreadGroupMessages.AddAsync(new UnreadGroupMessage
                {
                    MessageId = message.Id,
                    ReceiverId = u.Id,
                    GroupId = message.GroupId
                });
                await _context.SaveChangesAsync();

            }

            //await _notificationsService.AddUnreadMessageNotification(message, receiver.Email, entry.Entity);
        }

        public async Task MarkMessageAsRead(UnreadGroupMessageDTO unreadGroupMessageDto)
        {
            var unreadMessage = await _context.UnreadGroupMessages.FirstOrDefaultAsync(
                message => message.MessageId == unreadGroupMessageDto.MessageId &&
                message.ReceiverId == unreadGroupMessageDto.ReceiverId &&
                message.GroupId == unreadGroupMessageDto.GroupId 
            );

            _context.UnreadGroupMessages.Remove(unreadMessage);
            await _context.SaveChangesAsync();

            //await _notificationsService.DeleteUnreadMessageNotification(unreadMessage.ReceiverId, unreadMessage.Id);
        }
=======

        public async Task<ReadAndUnreadGroupMessages> GetReadAndUnreadAsync(Guid groupId, Guid userId)
        {
            var messagesWithoutAvatars = await _context.GroupMessages
                .Include(msg => msg.Author)
                .Include(msg => msg.Group)
                .OrderBy(msg => msg.CreatedAt)
                .Where(p => p.GroupId == groupId) // Filter here
                .ToListAsync();

            if (messagesWithoutAvatars == null) throw new Exception("No messages");

            var messages = await messagesWithoutAvatars.LoadAvatarsAsync(_blobStorageSettings, msg => msg.Author);
            var receivingMessages = messages.Where(m => m.AuthorId != userId);

            var unreadMessages = receivingMessages.Where(
                m => _context.UnreadGroupMessages.Any(um => um.MessageId == m.Id && um.ReceiverId == userId)
            );

            var readMessages = messages.Except(unreadMessages).ToList();
                
            var readAndUnreadMessages = new ReadAndUnreadGroupMessages
            {
                ReadMessages = _mapper.Map<IEnumerable<GroupMessageDTO>>(readMessages),
                UnreadMessages = _mapper.Map<IEnumerable<GroupMessageDTO>>(unreadMessages)
            };

            return readAndUnreadMessages;
        }
        public async Task AddUnreadGroupMessage(GroupMessage message)
        {
            var group = await _groupService.GetGroupAsync(message.GroupId);

            var groupUsers = await _groupService.GetAllUsersInGroupAsync(message.GroupId);
            var receivers = groupUsers.Where(gu => gu.Email != message.Author.Email);
            foreach (UserDTO u in receivers)
            {
                var entry = await _context.UnreadGroupMessages.AddAsync(new UnreadGroupMessage
                {
                    MessageId = message.Id,
                    ReceiverId = u.Id,
                    GroupId = message.GroupId
                });
                await _context.SaveChangesAsync();
                await _notificationsService.AddUpdateUnreadGroupMessageNotification(message, u.Email, entry.Entity);
            }
        }

        public async Task MarkMessageAsRead(UnreadGroupMessageDTO unreadGroupMessageDto)
        {
            var unreadMessage = await _context.UnreadGroupMessages.FirstOrDefaultAsync(
                message => message.MessageId == unreadGroupMessageDto.MessageId &&
                message.ReceiverId == unreadGroupMessageDto.ReceiverId &&
                message.GroupId == unreadGroupMessageDto.GroupId 
            );

            _context.UnreadGroupMessages.Remove(unreadMessage);
            await _context.SaveChangesAsync();

            await _notificationsService.DeleteUpdateUnreadGroupMessageNotification(unreadMessage.ReceiverId, unreadMessage.Id);
        }

    }
}
