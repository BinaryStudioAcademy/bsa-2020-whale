using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whale.BLL.Services.Interfaces;
using Whale.Shared.DTO.Contact;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ContactsController : ControllerBase
    {
        private readonly IContactsService _contactsService;

        public ContactsController(IContactsService contactsService)
        {
            _contactsService = contactsService;
            
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            string email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            Console.WriteLine("email");
            Console.WriteLine(email);
            var contacts = await _contactsService.GetAllContactsAsync(email);
            if (contacts == null) return NotFound();

            return Ok(contacts);
        }

        [HttpGet("id/{contactId}")]
        public async Task<IActionResult> Get(Guid contactId)
        {
            string email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

            var contact = await _contactsService.GetContactAsync(contactId, email);

            if (contact == null) return NotFound();

            return Ok(contact);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateFromEmail([FromQuery(Name = "email")] string contactnerEmail)
        {
            try
            {
                var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
                var createdContact = await _contactsService.CreateContactFromEmailAsync(ownerEmail, contactnerEmail);

                return Created($"id/{createdContact.Id}", createdContact);
            }
            catch (Exception e)
            {
                return NotFound(e.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _contactsService.DeleteContactAsync(id);

            if (deleted) return NoContent();

            return NotFound();
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] ContactEditDTO contactDTO)
        {
            string email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

            await _contactsService.UpdateContactAsync(contactDTO, email);

            return Ok();
        }
    }
}