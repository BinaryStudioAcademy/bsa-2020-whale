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
using Whale.BLL.Services.Interfaces;

namespace Whale.BLL.Services
{
    public class ContactsService:BaseService, IContactsService
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
            var contact = await _context.Contacts
                .Include(c => c.Owner)
                .Include(c => c.Contactner)
                .FirstOrDefaultAsync(c => c.Id == contactId);

            if (contact == null) throw new Exception("No such contact");

            return _mapper.Map<ContactDTO>(contact);
        }

        public async Task<ContactDTO> CreateContactAsync(ContactCreateDTO contactDTO)
        {
            var entity = _mapper.Map<Contact>(contactDTO);

            var contact = _context.Contacts.FirstOrDefault(c => c.ContactnerId == contactDTO.ContactnerId && c.OwnerId == contactDTO.OwnerId);

            if (contact != null) throw new Exception("Such contact is already exist");

            _context.Contacts.Add(entity);
            await _context.SaveChangesAsync();

            var createdContact = await _context.Contacts
                .Include(c => c.Owner)
                .Include(c => c.Contactner)
                .FirstAsync(c => c.Id == entity.Id);

            return _mapper.Map<ContactDTO>(createdContact);
        }

        public async Task UpdateContactAsync(ContactEditDTO contactDTO)
        {
            var entity = _context.Contacts.FirstOrDefault(c => c.Id == contactDTO.Id);

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

        public async Task<ContactDTO> CreateContactFromEmailAsync(string ownerEmail, string contactnerEmail)
        {
            var owner = _context.Users.FirstOrDefaultAsync(u => u.Email == ownerEmail);
            var contactner = _context.Users.FirstOrDefaultAsync(u => u.Email == contactnerEmail);
            await Task.WhenAll(owner, contactner);
            if (owner.Result is null)
                throw new Exception("Owner invalid");
            if (contactner.Result is null)
                throw new Exception("Contactner invalid");

            var contact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.ContactnerId == contactner.Result.Id && c.OwnerId == owner.Result.Id);
            if (contact is object)
                throw new Exception("Such contact is already exist");

            contact = new Contact()
            {
                OwnerId = owner.Result.Id,
                ContactnerId = contactner.Result.Id,
                IsBlocked = false
            };
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return await GetContactAsync(contact.Id);
        }
    }
}
