using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Whale.BLL.Services.Interfaces;
using Whale.Shared.DTO.Contact;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        private readonly IContactsService _contactsService;

        public ContactsController(IContactsService contactsService)
        {
            _contactsService = contactsService;
        }

        [HttpGet("{ownerId}")]
        public async Task<IActionResult> GetAll(Guid ownerId)
        {
            var contacts = await _contactsService.GetAllContactsAsync(ownerId);

            return Ok(contacts);
        }

        [HttpGet("id/{contactId}")]
        public async Task<IActionResult> Get(Guid contactId)
        {
            var contact = await _contactsService.GetContactAsync(contactId);

            if (contact == null) return NotFound();

            return Ok(contact);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ContactCreateDTO contactDTO)
        {
            var createdContact = await _contactsService.CreateContactAsync(contactDTO);

            return Created($"id/{createdContact.Id}", createdContact);
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
            await _contactsService.UpdateContactAsync(contactDTO);

            return Ok();
        }
    }
}
