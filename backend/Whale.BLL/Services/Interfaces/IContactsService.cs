using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Whale.Shared.DTO.Contact;

namespace Whale.BLL.Services.Interfaces
{
    public interface IContactsService
    {
        Task<IEnumerable<ContactDTO>> GetAllContactsAsync(Guid ownerId);
        Task<ContactDTO> GetContactAsync(Guid contactId);
        Task<ContactDTO> CreateContactAsync(ContactCreateDTO contactDTO);
        Task UpdateContactAsync(ContactEditDTO contactDTO);
        Task<bool> DeleteContactAsync(Guid contactId);
        Task<ContactDTO> CreateContactFromEmailAsync(string ownerEmail, string contactnerEmail);
    }
}
