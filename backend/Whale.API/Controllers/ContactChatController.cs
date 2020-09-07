using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Services;
using Whale.Shared.Models.DirectMessage;

namespace Whale.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class ContactChatController : ControllerBase
    {
        private readonly ContactChatService _chatService;

        public ContactChatController(ContactChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpGet("{contactDTOId}")]
        public async Task<ActionResult<ICollection<DirectMessageDTO>>> Get(Guid contactDTOId)
        {
            var email = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var messages = await _chatService.GetAllContactsMessagesAsync(contactDTOId, email);
            return Ok(messages);
        }

        [HttpGet("withUnread/{contactDTOId}")]
        public async Task<ActionResult<ICollection<DirectMessageDTO>>> Get(Guid contactDTOId, Guid userId)
        {
            var email = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var messages = await _chatService.GetReadAndUnreadAsync(contactDTOId, userId, email);
            return Ok(messages);
        }

        [HttpPost]
        public async Task<ActionResult<DirectMessageDTO>> CreateDirectMessage([FromBody] DirectMessageCreateDTO dto)
        {
            var email = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            return Ok(await _chatService.CreateDirectMessageAsync(dto, email));
        }

        [HttpPost("markRead")]
        public async Task<OkResult> MarkMessageAsRead([FromBody] UnreadMessageIdDTO unreadMessageIdDto)
        {
            var email = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            await _chatService.MarkMessageAsReadAsync(unreadMessageIdDto, email);
            return Ok();
        }
    }
}

