﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Whale.BLL.Services;
using Whale.Shared.DTO.DirectMessage;
using Whale.Shared.DTO.Contact;

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

        [HttpPost]
        public async Task<ActionResult<DirectMessageDTO>> CreateDirectMessage([FromBody] DirectMessageCreateDTO dto)
        {
            return Ok(await _chatService.CreateDirectMessage(dto));
        }


    }
}
