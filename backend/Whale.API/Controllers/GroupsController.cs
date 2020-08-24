using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Whale.Shared.Services;
using Whale.Shared.Models.Group;
using Whale.Shared.Models.Group.GroupUser;

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
        public async Task<ActionResult<IEnumerable<GroupDTO>>> GetAll()
        {
            string email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            
            var contacts = await _groupService.GetAllGroupsAsync(email);
            if (contacts == null) return NotFound();

            return Ok(contacts);
        }

        [HttpGet("id/{groupId}")]
        public async Task<ActionResult<GroupDTO>> Get(Guid groupId)
        {
            string email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

            var group = await _groupService.GetGroupAsync(groupId, email);

            if (group == null) return NotFound();

            return Ok(group);
        }

        [HttpPost]
        public async Task<ActionResult<GroupDTO>> CreateNewGroup([FromBody] GroupCreateDTO newGroup)
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

        [HttpDelete("{groupId}/{userEmail}")]
        public async Task<IActionResult> RemoveUserFromGroup(Guid groupId, string userEmail)
        {
            var deleted = await _groupService.RemoveUserFromGroup(groupId, userEmail);

            if (deleted) return NoContent();

            return NotFound();
        }

        [HttpPost("user")]
        public async Task<ActionResult<GroupUserDTO>> CreateNewUserInGroup([FromBody] GroupUserCreateDTO newUserInGroup)
        {
            Console.WriteLine(newUserInGroup.UserEmail);
            var createdUserInGroup = await _groupService.AddUserToGroupAsync(newUserInGroup);
            return Created($"id/{createdUserInGroup.Id}", createdUserInGroup);
        }

        [HttpGet("users/{id}")]
        public async Task<ActionResult<IEnumerable<GroupUserDTO>>> GetAllUsersInGroup(Guid id)
        {
            return Ok(await _groupService.GetAllUsersInGroupAsync(id));
        }
    }
}
