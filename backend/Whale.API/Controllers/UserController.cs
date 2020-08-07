using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Whale.BLL.Services.Interfaces;
using Whale.Shared.DTO.User;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpGet("id/{userId}")]
        public async Task<IActionResult> Get(Guid userId)
        {
            var user = await _userService.GetUserAsync(userId);

            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserCreateDTO userDTO)
        {
            var createdUser = await _userService.CreateUserAsync(userDTO);

            return Created($"id/{createdUser.Id}", createdUser);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UserDTO userDTO)
        {
            await _userService.UpdateUserAsync(userDTO);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _userService.DeleteUserAsync(id);

            if (deleted) return NoContent();

            return NotFound();
        }
    }
}
