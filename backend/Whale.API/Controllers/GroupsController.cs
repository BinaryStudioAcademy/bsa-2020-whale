using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Whale.Shared.Services;
using Whale.Shared.DTO.Group;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GroupsController : ControllerBase
    {
        private readonly GroupService _groupService;

        public GroupsController(GroupService groupService)
        {
            _groupService = groupService;

        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            string email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            Console.WriteLine("email");
            Console.WriteLine(email);
            var contacts = await _groupService.GetAllGroupsAsync(email);
            if (contacts == null) return NotFound();

            return Ok(contacts);
        }

        [HttpGet("id/{groupId}")]
        public async Task<IActionResult> Get(Guid groupId)
        {
            string email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

            var contact = await _groupService.GetGroupAsync(groupId, email);

            if (contact == null) return NotFound();

            return Ok(contact);
        }

        [HttpPost]
        public async Task<IActionResult> CreateNewGroup([FromBody] GroupCreateDTO newGroup)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            var createdGroup = await _groupService.CreateGroupAsync(newGroup, ownerEmail);

            return Created($"id/{createdGroup.Id}", createdGroup);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _groupService.DeleteGroupAsync(id);

            if (deleted) return NoContent();

            return NotFound();
        }

    }
}
