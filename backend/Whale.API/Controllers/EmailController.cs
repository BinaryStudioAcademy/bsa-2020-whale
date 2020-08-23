using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services;

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
		public async Task<OkResult> SendEmail([FromBody] object inviteDto)
		{
			await _emailServcice.Execute();
			return Ok();
		}
	}
}
