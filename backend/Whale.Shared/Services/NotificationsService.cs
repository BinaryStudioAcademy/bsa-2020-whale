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
            var createdNotificationDTO = _mapper.Map<NotificationDTO>(notification);

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
    }
}
