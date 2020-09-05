using AutoMapper;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Models.Notification;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Messages;
using Whale.Shared.Exceptions;
using Whale.Shared.Models.Notification;
using Whale.Shared.Services.Abstract;

namespace Whale.Shared.Services
{
    public class NotificationsService : BaseService
    {
        private readonly SignalrService _signalrService;

        private readonly JsonSerializerSettings camelSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            Formatting = Formatting.Indented
        };

        public NotificationsService(WhaleDbContext context, IMapper mapper, SignalrService signalrService) : base(context, mapper)
        {
            _signalrService = signalrService;
        }

        public async Task<IEnumerable<NotificationDTO>> GetAllNotificationsAsync(string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var notifications = _context.Notifications
                 .Where(n => n.UserId == user.Id);

            return _mapper.Map<IEnumerable<NotificationDTO>>(notifications);
        }

        private async Task<NotificationDTO> AddNotification(string userEmail, string options, NotificationTypeEnum type)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var notification = new Notification()
            {
                UserId = user.Id,
                User = user,
                CreatedAt = DateTimeOffset.Now,
                NotificationType = type,
                Options = options
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            var createdNotificationDTO = new NotificationDTO()
            {
                Id = notification.Id,
                CreatedAt = notification.CreatedAt,
                NotificationType = notification.NotificationType,
                Options = notification.Options
            };

            var connection = await _signalrService.ConnectHubAsync("whale");
            await connection.InvokeAsync("onNewNotification", userEmail, createdNotificationDTO);

            return createdNotificationDTO;
        }

        public Task<NotificationDTO> AddTextNotification(string userEmail, string message)
        {
            var options = new OptionsText()
            {
                Message = message
            };

            return AddNotification(userEmail, JsonConvert.SerializeObject(options, camelSettings), NotificationTypeEnum.TextNotification);
        }

        public Task<NotificationDTO> AddContactNotification(string owner, string contacter)
        {
            var options = new OptionsAddContact
            {
                ContactEmail = owner,
            };

            return AddNotification(contacter, JsonConvert.SerializeObject(options, camelSettings), NotificationTypeEnum.AddContactNotification);
        }

        public Task<NotificationDTO> InviteMeetingNotification(string owner, string contacter, string link)
        {
            var options = new OptionsInviteMeeting
            {
                Link = link,
                ContactEmail = owner
            };

            return AddNotification(contacter, JsonConvert.SerializeObject(options, camelSettings), NotificationTypeEnum.MeetingInviteNotification);
        }

        public async Task DeleteNotificationPendingContactAsync(string owner, string contacter)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == contacter);
            if (user is null)
                throw new NotFoundException("User", contacter);
            var options = new OptionsAddContact
            {
                ContactEmail = owner,
            };
            var optionsDTO = JsonConvert.SerializeObject(options, camelSettings);
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.UserId == user.Id && n.Options == optionsDTO);

            if (notification is null)
                throw new NotFoundException("Notification");

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            var connection = await _signalrService.ConnectHubAsync("whale");
            await connection.InvokeAsync("onDeleteNotification", contacter, notification.Id);
            return;
        }

        public async Task DeleteNotificationAsync(string userEmail, Guid notificationId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);

            if (user is null)
                throw new NotFoundException("User", userEmail);

            var notification = _context.Notifications.FirstOrDefault(n => n.Id == notificationId && n.UserId == user.Id);

            if (notification is null)
                throw new NotFoundException("Notification", notificationId.ToString());

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return;
        }

        public async Task<NotificationDTO> UpdateNotificationAsync(NotificationDTO notDto)
        {
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notDto.Id);

            if (notification == null)
                throw new NotFoundException("Notification", notDto.Id.ToString());

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == notification.UserId);

            if (user is null)
                throw new NotFoundException("User", user.Id.ToString());

            notification.NotificationType = notDto.NotificationType;
            notification.Options = notDto.Options;

            _context.Notifications.Update(notification);
            await _context.SaveChangesAsync();

            var updatedNotificationDTO = _mapper.Map<NotificationDTO>(notification);

            var connection = await _signalrService.ConnectHubAsync("whale");
            await connection.InvokeAsync("onUpdateNotification", user.Email, updatedNotificationDTO);

            return updatedNotificationDTO;
        }

        public async Task UpdateInviteMeetingNotifications(string link)
        {
            var noticications = _context.Notifications.Where(n => n.Options.Contains(link)).ToList();
            if (noticications.Count == 0)
                return;

            var email = JsonConvert.DeserializeObject<OptionsInviteMeeting>(noticications[0].Options, camelSettings).ContactEmail;

            var options = new OptionsText
            {
                Message = $"Missed meeting invitation from {email}",
            };

            var optionsString = JsonConvert.SerializeObject(options, camelSettings);

            foreach (var not in noticications)
            {
                var unpdatedNotification = _mapper.Map<NotificationDTO>(not);
                unpdatedNotification.NotificationType = NotificationTypeEnum.TextNotification;
                unpdatedNotification.Options = optionsString;
                await UpdateNotificationAsync(unpdatedNotification);
            }
        }

        public async Task AddUpdateUnreadMessageNotification(DirectMessage message, string receiverEmail, UnreadMessageId unreadMessageId)
        {
            var notification = await _context.Notifications.FirstOrDefaultAsync(
                n => n.NotificationType == NotificationTypeEnum.UnreadMessage &&
                     n.User.Email == receiverEmail &&
                     n.Options.Contains(message.ContactId.ToString()));

            if (notification == null)
            {
                var options = new UnreadMessageOptions
                {
                    ContactId = message.ContactId,
                    UnreadMessageIds = new List<UnreadMessageId> { unreadMessageId },
                    SenderName = $"{message.Author.FirstName} {message.Author.SecondName}"
                };

                var optionsJson = JsonConvert.SerializeObject(options, camelSettings);

                await AddNotification(receiverEmail, optionsJson, NotificationTypeEnum.UnreadMessage);
            }
            else
            {
                var unpdatedNotification = _mapper.Map<NotificationDTO>(notification);

                var options = JsonConvert.DeserializeObject<UnreadMessageOptions>(notification.Options, camelSettings);
                options.UnreadMessageIds.Add(unreadMessageId);
                unpdatedNotification.Options = JsonConvert.SerializeObject(options, camelSettings);

                await UpdateNotificationAsync(unpdatedNotification);
            }
        }

        public async Task AddUpdateUnreadGroupMessageNotification(GroupMessage message, string receiverEmail, UnreadGroupMessage unreadGroupMessage)
        {
            var notification = await _context.Notifications.FirstOrDefaultAsync(
                n => n.NotificationType == NotificationTypeEnum.UnreadGroupMessage &&
                     n.User.Email == receiverEmail &&
                     n.Options.Contains(message.GroupId.ToString()));

            if (notification == null)
            {
                var options = new UnreadGroupMessageOptions
                {
                    GroupId = message.GroupId,
                    UnreadGroupMessages = new List<UnreadGroupMessage> { unreadGroupMessage },
                    GroupName = $"{message.Group.Label}"
                };

                var optionsJson = JsonConvert.SerializeObject(options, camelSettings);

                await AddNotification(receiverEmail, optionsJson, NotificationTypeEnum.UnreadGroupMessage);
            }
            else
            {
                var unpdatedNotification = _mapper.Map<NotificationDTO>(notification);

                var options = JsonConvert.DeserializeObject<UnreadGroupMessageOptions>(notification.Options, camelSettings);
                options.UnreadGroupMessages.Add(unreadGroupMessage);
                unpdatedNotification.Options = JsonConvert.SerializeObject(options, camelSettings);

                await UpdateNotificationAsync(unpdatedNotification);
            }
        }

        public async Task DeleteUpdateUnreadMessageNotification(Guid userId, Guid unreadMessageId)
        {
            var notification = await _context.Notifications.FirstOrDefaultAsync(
                n => n.NotificationType == NotificationTypeEnum.UnreadMessage &&
                     n.UserId == userId &&
                     n.Options.Contains(unreadMessageId.ToString()));

            if (notification == null)
            {
                return;
            }

            var options = JsonConvert.DeserializeObject<UnreadMessageOptions>(notification.Options, camelSettings);

            if (options.UnreadMessageIds.Count == 1)
            {
                await DeleteNotificationByEntity(notification);
                return;
            }

            var unpdatedNotification = _mapper.Map<NotificationDTO>(notification);
            var readMsgIndex = options.UnreadMessageIds.FindIndex(m => m.Id == unreadMessageId);
            options.UnreadMessageIds.RemoveRange(0, readMsgIndex + 1);
            if (options.UnreadMessageIds.Count == 0)
            {
                await DeleteNotificationByEntity(notification);
                return;
            }

            unpdatedNotification.Options = JsonConvert.SerializeObject(options, camelSettings);

            await UpdateNotificationAsync(unpdatedNotification);

        }

        public async Task DeleteUpdateUnreadGroupMessageNotification(Guid userId, Guid unreadGroupMessage)
        {
            var notification = await _context.Notifications.FirstOrDefaultAsync(
                n => n.NotificationType == NotificationTypeEnum.UnreadGroupMessage &&
                     n.UserId == userId &&
                     n.Options.Contains(unreadGroupMessage.ToString()));

            if (notification == null)
            {
                return;
            }

            var options = JsonConvert.DeserializeObject<UnreadGroupMessageOptions>(notification.Options, camelSettings);

            if (options.UnreadGroupMessages.Count == 1)
            {
                await DeleteNotificationByEntity(notification);
                return;
            }

            var unpdatedNotification = _mapper.Map<NotificationDTO>(notification);
            var readMsgIndex = options.UnreadGroupMessages.FindIndex(m => m.Id == unreadGroupMessage);
            options.UnreadGroupMessages.RemoveRange(0, readMsgIndex + 1);
            if (options.UnreadGroupMessages.Count == 0)
            {
                await DeleteNotificationByEntity(notification);
                return;
            }

            unpdatedNotification.Options = JsonConvert.SerializeObject(options, camelSettings);

            await UpdateNotificationAsync(unpdatedNotification);

        }

        private async Task DeleteNotificationByEntity(Notification notification)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == notification.UserId);
            if (user is null)
                throw new NotFoundException("User", notification.UserId.ToString());

            var connection = await _signalrService.ConnectHubAsync("whale");
            await connection.InvokeAsync("onDeleteNotification", user.Email, notification.Id);
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
        }
    }
}
