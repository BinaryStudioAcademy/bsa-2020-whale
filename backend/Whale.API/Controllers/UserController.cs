using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Text.RegularExpressions;
using Whale.Shared.Models;
using System.Linq;
using Whale.Shared.Services;
using Whale.Shared.Exceptions;
using Whale.Shared.Models.User;
using System.Security.Claims;

namespace Whale.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<UserDTO>> GetCurrentUser()
        {
            var email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var contact = await _userService.GetUserByEmailAsync(email);
            if (contact == null)
                return NotFound();

            return Ok(contact);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> Get(Guid id)
        {
            if (id == Guid.Empty)
                throw new BaseCustomException("Invalid id");

            var user = await _userService.GetUserAsync(id);

            return Ok(user);
        }

        [HttpGet("email/{email}")]
        public async Task<ActionResult<UserDTO>> GetUserByEmail(string email)
        {
            if (!Regex.IsMatch(email,
                @"^(?("")("".+?(?<!\\)""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-0-9a-z]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$",
                RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250)))
            {
                throw new BaseCustomException("Invaid email format");
            }

            var result = await _userService.GetUserByEmailAsync(email);

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<UserDTO>> AddUser([FromBody] UserModel user)
        {
            var email =  HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var name = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == "name")?.Value;
            if (!ModelState.IsValid || user.Email != email || user.DisplayName != name)
                throw new BaseCustomException("Invalid data");

            var result = await _userService.CreateUser(user);

            return Ok(result);
        }

        [HttpPut]
        public async Task<ActionResult<UserDTO>> Update([FromBody] UserDTO userDTO)
        {
            var email = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (!ModelState.IsValid || userDTO.Email != email)
                throw new BaseCustomException("Invalid data");
            return Ok( await _userService.UpdateUserAsync(userDTO));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var email = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            await _userService.DeleteUserAsync(id, email);
            return NoContent();
        }
    }
}
