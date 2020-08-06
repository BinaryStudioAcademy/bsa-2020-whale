using System;
using System.Collections.Generic;
using Whale.BLL.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using System.Linq;
using AutoMapper;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Whale.Shared.DTO.Contact;

namespace Whale.BLL.Services
{
    public class ContactsService:BaseService
    {
        public ContactsService(WhaleDbContext context, IMapper mapper) : base(context, mapper)
        {
        }

        public async Task<IEnumerable<ContactDTO>> GetAllContactsAsync(Guid ownerId)
        {
            var contacts = await _context.Contacts
                .Include(c => c.Owner)
                .Include(c => c.Contactner)
                .Where(c => c.OwnerId == ownerId).ToListAsync();

            return _mapper.Map<IEnumerable<ContactDTO>>(contacts);
        }

        public async Task<ContactDTO> GetContactAsync(Guid contactId)
        {
            var contact = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == contactId);

            if (contact == null) throw new Exception("No such contact");

            return _mapper.Map<ContactDTO>(contact);
        }

        public async Task CreateContactAsync(ContactCreateDTO contactDTO)
        {
            var entity = _mapper.Map<Contact>(contactDTO);

            var contact = _context.Contacts.FirstOrDefault(c => c.ContactnerId == contactDTO.ContactnerId && c.OwnerId == contactDTO.OwnerId);

            if (contact != null) throw new Exception("Such contact is already exist");

            _context.Contacts.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateContactAsync(ContactEditDTO contactDTO)
        {
            var entity = _context.Contacts.FirstOrDefault(c => c.OwnerId == contactDTO.OwnerId && c.ContactnerId == contactDTO.ContactnerId);

            if (entity == null) throw new Exception("No such contact");

            entity.IsBlocked = contactDTO.IsBlocked;

            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteContactAsync(Guid contactId)
        {
            var contact = _context.Contacts.FirstOrDefault(c => c.Id == contactId);

            if (contact == null) return false;

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
