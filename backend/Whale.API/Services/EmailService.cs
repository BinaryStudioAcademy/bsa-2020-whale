using AutoMapper;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Email;
using Whale.Shared.Models.Email;
using Whale.Shared.Services;

namespace Whale.API.Services
{
	public class EmailService: BaseService
	{
        private readonly RedisService _redisService;
        private readonly UserService _userService;

        public EmailAddress From { get; set; } = new EmailAddress("whale@whale.com", "Whale");

        public EmailService(WhaleDbContext context, IMapper mapper, RedisService redisService, UserService userService)
            :base(context, mapper)
        {
            _redisService = redisService;
            _userService = userService;
        }

        public async Task SendMeetingInvites(MeetingInviteDTO meetingInviteDto)
        {
            var apiKey = Environment.GetEnvironmentVariable("SENDGRID_API_KEY", EnvironmentVariableTarget.Machine);
            var client = new SendGridClient(apiKey);

            var meeting = _context.Meetings.FirstOrDefault(meeting => meeting.Id == meetingInviteDto.MeetingId);
            var sender = _context.Users.FirstOrDefault(user => user.Id == meetingInviteDto.SenderId);
            var receivers = _context.Users.Where(user => meetingInviteDto.ReceiverEmails.Any(email => user.Email == email));

            var tos = receivers.Select(user => new EmailAddress { Email = user.Email }).ToList();

            var templateData = GenerateMeetingInviteTemplateData(sender, receivers, meetingInviteDto.MeetingLink);

            var mail = MailHelper.CreateMultipleTemplateEmailsToMultipleRecipients(
                From,
                tos,
                "d-34bfcd5441b544a1a3e7cb8a0cdcac24",
                templateData
            );

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
