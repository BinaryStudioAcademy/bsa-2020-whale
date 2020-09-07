using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whale.Shared.Models.Contact;
using Whale.Shared.Services;

namespace Whale.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class ContactsController : ControllerBase
    {
        private readonly ContactsService _contactsService;

        public ContactsController(ContactsService contactsService)
        {
            _contactsService = contactsService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactDTO>>> GetAll()
        {
            var email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            Console.WriteLine("email");
            Console.WriteLine(email);
            var contacts = await _contactsService.GetAllContactsAsync(email);
            if (contacts == null) return NotFound();

            return Ok(contacts);
        }

        [HttpGet("accepted")]
        public async Task<ActionResult<IEnumerable<ContactDTO>>> GetAccepted()
        {
            var email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            Console.WriteLine("email");
            Console.WriteLine(email);
            var contacts = await _contactsService.GetAcceptedContactsAsync(email);
            if (contacts == null)
                return NotFound();

            return Ok(contacts);
        }

        [HttpGet("id/{contactId}")]
        public async Task<ActionResult<ContactDTO>> Get(Guid contactId)
        {
            var email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            var contact = await _contactsService.GetContactAsync(contactId, email);

            if (contact == null) return NotFound();

            return Ok(contact);
        }

        [HttpPost("create")]
        public async Task<ActionResult<ContactDTO>> CreateFromEmail([FromQuery(Name = "email")] string contactnerEmail)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var createdContact = await _contactsService.CreateContactFromEmailAsync(ownerEmail, contactnerEmail);
            return Created($"id/{createdContact.Id}", createdContact);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var deleted = await _contactsService.DeleteContactAsync(id, email);

            if (deleted) return NoContent();

            return NotFound();
        }

        [HttpDelete("email/{contactEmail}")]
        public async Task<IActionResult> DeletePendingContactByEmail(string contactEmail)
        {
            var userEmail = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var deleted = await _contactsService.DeletePendingContactByEmailAsync(contactEmail, userEmail);

            if (deleted) return NoContent();

            return NotFound();
        }

        [HttpPut]
        public async Task<ActionResult<ContactDTO>> Update([FromBody] ContactEditDTO contactDTO)
        {
            var email = HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            return Ok (await _contactsService.UpdateContactAsync(contactDTO, email));
        }
    }
}