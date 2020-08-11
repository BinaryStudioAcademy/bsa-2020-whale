using Microsoft.AspNetCore.Mvc;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Whale.BLL.Exceptions;
using Whale.BLL.Services.Interfaces;
using Whale.Shared.DTO.User;
using Whale.Shared.Models;

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

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
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
                @"^(?("")("".+?(?<!\\)""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))" +
                @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-0-9a-z]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$",
                RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250)))
            {
                throw new BaseCustomException("Invaid email format");
            }

            var result = await _userService.GetUserByEmail(email);

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<UserDTO>> AddUser([FromBody] UserModel user)
        {
            if (!ModelState.IsValid)
                throw new BaseCustomException("Invalid data");

            var result = await _userService.CreateUser(user);

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
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }
    }
}
