using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Email;
using Whale.DAL.Settings;
using Whale.Shared.Models.Email;
using Whale.Shared.Services;

namespace Whale.API.Services
{
	public class EmailService: BaseService
	{
        private readonly RedisService _redisService;
        private readonly UserService _userService;
        private readonly NotificationsService _notifications;
        private readonly IOptions<SendGridSettings> _sendGridSettings;

        public EmailAddress From { get; set; } = new EmailAddress("whale@whale.com", "Whale");

        public EmailService(WhaleDbContext context, IMapper mapper, RedisService redisService, UserService userService, IOptions<SendGridSettings> sendGridSettings, NotificationsService notifications)
            :base(context, mapper)
        {
            _redisService = redisService;
            _userService = userService;
            _sendGridSettings = sendGridSettings;
            _notifications = notifications;
        }

        public async Task SendMeetingInvites(MeetingInviteDTO meetingInviteDto)
        {


            var meeting = _context.Meetings.FirstOrDefault(meeting => meeting.Id == meetingInviteDto.MeetingId);
            var sender = _context.Users.FirstOrDefault(user => user.Id == meetingInviteDto.SenderId);
            var receivers = _context.Users.Where(user => meetingInviteDto.ReceiverEmails.Any(email => user.Email == email));
            
            var tos = receivers.Select(user => new EmailAddress { Email = user.Email }).ToList();

            foreach (var email in tos)
            {
                await _notifications.InviteMeetingNotification(sender.Email, email.Email, meetingInviteDto.MeetingLink);
            }

            var templateData = GenerateMeetingInviteTemplateData(sender, receivers, meetingInviteDto.MeetingLink);

            var mail = MailHelper.CreateMultipleTemplateEmailsToMultipleRecipients(
                From,
                tos,
                "d-34bfcd5441b544a1a3e7cb8a0cdcac24",
                templateData
            );

            var apiKey = _sendGridSettings.Value.ApiKey; // Environment.GetEnvironmentVariable("SENDGRID_API_KEY", EnvironmentVariableTarget.Machine);
            var client = new SendGridClient(apiKey);

            await client.SendEmailAsync(mail);
        }

        public async Task SendMeetingInviteToHost(ScheduledMeetingInvite meetingInvite)
        {
            var meeting = await _context.Meetings.FirstOrDefaultAsync(meeting => meeting.Id == meetingInvite.MeetingId);
            var to = new EmailAddress(meetingInvite.ReceiverEmail);

            var templateData = new Dictionary<string, string>
            {
                { "receiverName", meetingInvite.ReceiverName },
                { "startTime", meeting.StartTime.ToString("f", new CultureInfo("us-EN")) },
                { "meetingLink", meetingInvite.MeetingLink }
            };

            var mail = MailHelper.CreateSingleTemplateEmail(From, to, "d-790722851c484caca8da3722f011212d", templateData);

            var apiKey = _sendGridSettings.Value.ApiKey;
            var client = new SendGridClient(apiKey);

            await client.SendEmailAsync(mail);
        }

        public List<object> GenerateMeetingInviteTemplateData(User sender, IEnumerable<User> receivers, string meetingLink)
        {
            return 
            receivers.Select(u => new Dictionary<string, string>
            {
                { "senderName", sender.FirstName },
                { "receiverName", u.FirstName },
                { "meetingLink", meetingLink }
            } as object)
            .ToList();
        }
    }
}
