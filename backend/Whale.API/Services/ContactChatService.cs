using AutoMapper;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Messages;
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
        private readonly NotificationsService _notificationsService;

        public ContactChatService(WhaleDbContext context, IMapper mapper, SignalrService signalrService, BlobStorageSettings blobStorageSettings, NotificationsService notificationsService) 
            : base(context, mapper)
        {
            _signalrService = signalrService;
            _blobStorageSettings = blobStorageSettings;
            _notificationsService = notificationsService;
        }
        //var receivingMessages = messages.Where(m => m.ContactId != m.AuthorId);

        //var unreadMessages = _context.UnreadMessages.Where(um => um.ReceiverId == contactId);
        public async Task<ICollection<DirectMessage>> GetAllContactsMessagesAsync(Guid contactId)
        {
            var messages = await _context.DirectMessages
                .Include(msg => msg.Author)
                .OrderBy(msg => msg.CreatedAt)
                .Where(p => p.ContactId == contactId) // Filter here
                .ToListAsync();
            if (messages == null) throw new Exception("No messages");
           
            return _mapper.Map<ICollection<DirectMessage>>(await messages.LoadAvatarsAsync(_blobStorageSettings, msg => msg.Author));
        }

        public async Task<ReadAndUnreadMessagesDTO> GetReadAndUnreadAsync(Guid contactId, Guid userId)
        {
            var messagesWithoutAvatars = await _context.DirectMessages
                .Include(msg => msg.Author)
                .OrderBy(msg => msg.CreatedAt)
                .Where(p => p.ContactId == contactId) // Filter here
                .ToListAsync();

            if (messagesWithoutAvatars == null) throw new Exception("No messages");

            var messages = await messagesWithoutAvatars.LoadAvatarsAsync(_blobStorageSettings, msg => msg.Author);
            var receivingMessages = messages.Where(m => m.AuthorId != userId);

            var unreadMessages = receivingMessages.Where(
                m => _context.UnreadMessageIds.Any(um => um.MessageId == m.Id && um.ReceiverId == userId)
            );

            var readMessages = messages.Except(unreadMessages).ToList();

            var readAndUnreadMessages = new ReadAndUnreadMessagesDTO
            {
                ReadMessages = _mapper.Map<IEnumerable<DirectMessageDTO>>(readMessages),
                UnreadMessages = _mapper.Map<IEnumerable<DirectMessageDTO>>(unreadMessages)
            };

            return readAndUnreadMessages;
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

            await AddUnreadMessage(createdMessage);

            var connection = await _signalrService.ConnectHubAsync("chatHub");
            await connection.InvokeAsync("NewMessageReceived", createdMessageDTO);

            return createdMessageDTO;
        }

        public async Task AddUnreadMessage(DirectMessage message)
        {
            var contact = await _context.Contacts
                .Include(c => c.FirstMember)
                .Include(c => c.SecondMember)
                .FirstOrDefaultAsync(c => c.Id == message.ContactId);

            var receiver = contact.FirstMemberId == message.AuthorId ? contact.SecondMember : contact.FirstMember;
            var entry = await _context.UnreadMessageIds.AddAsync(new UnreadMessageId
            {
                MessageId = message.Id,
                ReceiverId = receiver.Id
            });
            await _context.SaveChangesAsync();
         
            await _notificationsService.AddUpdateUnreadMessageNotification(message, receiver.Email, entry.Entity);
        }

        public async Task MarkMessageAsRead(UnreadMessageIdDTO unreadMessageDto)
        {
            var unreadMessage = await _context.UnreadMessageIds.FirstOrDefaultAsync(
                message => message.MessageId == unreadMessageDto.MessageId &&
                message.ReceiverId == unreadMessageDto.ReceiverId
            );

            _context.UnreadMessageIds.Remove(unreadMessage);
            await _context.SaveChangesAsync();

            await _notificationsService.DeleteUpdateUnreadMessageNotification(unreadMessage.ReceiverId, unreadMessage.Id);
        }
    }
}
