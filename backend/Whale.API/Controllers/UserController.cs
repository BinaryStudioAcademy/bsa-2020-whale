using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Whale.BLL.Services.Interfaces;
using System.Text.RegularExpressions;
using Whale.Shared.DTO.User;
using Whale.Shared.Models;
using System.Linq;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly string email;

        public UserController(IUserService userService)
        {
            _userService = userService;
            email = HttpContext?.User.Claims
               .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
        }

        [HttpGet]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userService.GetUserByEmail(email);

            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpGet("id/{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            if (id == Guid.Empty)
                return BadRequest("Invalid id");

            var user = await _userService.GetUserAsync(id);

            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpGet("email/{email}")]
        public async Task<ActionResult<UserDTO>> GetUserByEmail(string email)
        {
            if (!Regex.IsMatch(email,
                @"^(?("")("".+?(?<!\\)""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))" +
                @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-0-9a-z]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$",
                RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250)))
                return BadRequest("Invaid email format");

            var result = await _userService.GetUserByEmail(email);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<UserDTO>> AddUser([FromBody] UserModel user)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid data");

            var result = await _userService.CreateUser(user);

            if (result == null)
                return BadRequest("Such email already exists");

            return Ok(result);
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
