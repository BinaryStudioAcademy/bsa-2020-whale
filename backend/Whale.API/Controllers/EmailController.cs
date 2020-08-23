using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services;
using Whale.DAL.Models.Email;
using Whale.Shared.Models.Email;

namespace Whale.API.Controllers
{
	[ApiController]
	[Route("api/email")]
	public class EmailController: ControllerBase
	{
		private readonly EmailService _emailServcice;

		public EmailController(EmailService emailService)
		{
			_emailServcice = emailService;
		}

		[HttpPost]
		public async Task<IActionResult> SendEmail([FromBody] MeetingInviteDTO inviteDto)
		{
			var data = await _emailServcice.SendMeetingInvites(inviteDto);
			return Ok(data);
		}
	}
}
