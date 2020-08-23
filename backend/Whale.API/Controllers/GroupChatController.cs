using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Services;
using Whale.Shared.DTO.GroupMessage;
using Whale.Shared.Models.GroupMessage;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GroupChatController : ControllerBase
    {
        private readonly GroupChatService _chatService;

        public GroupChatController(GroupChatService chatService)
        {
            _chatService = chatService;

        }

        [HttpGet("{groupDTOId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ICollection<GroupMessageDTO>>> Get(Guid groupDTOId)
        {
            var messages = await _chatService.GetAllGroupsMessagesAsync(groupDTOId);
            return Ok(messages);
        }

        [HttpPost]
        public async Task<ActionResult<GroupMessageDTO>> CreateDirectMessage([FromBody] GroupMessageCreateDTO dto)
        {
            return Ok(await _chatService.CreateGroupMessage(dto));
        }
    }
}
