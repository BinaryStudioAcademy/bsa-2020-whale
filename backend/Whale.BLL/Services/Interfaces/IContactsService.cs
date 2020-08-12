using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Whale.Shared.DTO.Contact;

namespace Whale.BLL.Services.Interfaces
{
    public interface IContactsService
    {
        Task<IEnumerable<ContactDTO>> GetAllContactsAsync(string userEmail);
        Task<ContactDTO> GetContactAsync(Guid contactId, string userEmail);
        Task UpdateContactAsync(ContactEditDTO contactDTO, string userEmail);
        Task<bool> DeleteContactAsync(Guid contactId);
        Task<ContactDTO> CreateContactFromEmailAsync(string ownerEmail, string contactnerEmail);
    }
}
