using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Services;
using Whale.Shared.Models.DirectMessage;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactChatController : ControllerBase
    {
        private readonly ContactChatService _chatService;

        public ContactChatController(ContactChatService chatService)
        {
            _chatService = chatService;

        }

        [HttpGet("{contactDTOId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ICollection<DirectMessageDTO>>> Get(Guid contactDTOId)
        {
            var messages = await _chatService.GetAllContactsMessagesAsync(contactDTOId);
            return Ok(messages);
        }

        [HttpGet("withUnread/{contactDTOId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ICollection<DirectMessageDTO>>> Get(Guid contactDTOId, Guid userId)
        {
            var messages = await _chatService.GetReadAndUnreadAsync(contactDTOId, userId);
            return Ok(messages);
        }

        [HttpPost]
        public async Task<ActionResult<DirectMessageDTO>> CreateDirectMessage([FromBody] DirectMessageCreateDTO dto)
        {
            return Ok(await _chatService.CreateDirectMessage(dto));
        }

        [HttpPost("markRead")]
        public async Task<OkResult> MarkMessageAsRead([FromBody] UnreadMessageIdDTO unreadMessageIdDto)
        {
            await _chatService.MarkMessageAsRead(unreadMessageIdDto);
            return Ok();
        }
    }
}

