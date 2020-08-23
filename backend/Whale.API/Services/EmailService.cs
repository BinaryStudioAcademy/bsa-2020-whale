using AutoMapper;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models.Email;
using Whale.Shared.Models.Email;
using Whale.Shared.Services;

namespace Whale.API.Services
{
	public class EmailService: BaseService
	{
        private readonly RedisService _redisService;
        private readonly UserService _userService;

        public EmailService(WhaleDbContext context, IMapper mapper, RedisService redisService, UserService userService)
            :base(context, mapper)
        {
            _redisService = redisService;
            _userService = userService;
        }

        public async Task<SendGridMessage> SendMeetingInvites(MeetingInviteDTO meetingInviteDto)
        {
            var apiKey = Environment.GetEnvironmentVariable("SENDGRID_API_KEY");
            var client = new SendGridClient(apiKey);

            var meeting = _context.Meetings.FirstOrDefault(meeting => meeting.Id == meetingInviteDto.MeetingId);
            var sender = _context.Users.FirstOrDefault(user => user.Id == meetingInviteDto.SenderId);
            var receivers = _context.Users.Where(user => meetingInviteDto.ReceiverEmails.Any(email => user.Email == email));

            var from = new EmailAddress("da@whale.com", "Whale");
            var tos = receivers.Select(user => new EmailAddress { Email = user.Email }).ToList();
            
            var da = receivers.Select(r => new MeetingInvite
            {
                MeetingLink = "meeting__link",
                SenderName = $"{sender.FirstName} {sender.SecondName}",
                ReceiverName = $"{r.FirstName} {r.SecondName}"
            });

            var mail = MailHelper.CreateMultipleTemplateEmailsToMultipleRecipients(
                from,
                tos,
                "d-34bfcd5441b544a1a3e7cb8a0cdcac24",
                da as List<object>
            );
            // await client.SendEmailAsync(mail);

            return mail;
        }
    }
}
