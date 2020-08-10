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
using Whale.Shared.DTO.Contact.Setting;

namespace Whale.BLL.Services
{
    public class ContactsService:BaseService, IContactsService
    {
        public ContactsService(WhaleDbContext context, IMapper mapper) : base(context, mapper)
        { }

        public async Task<IEnumerable<ContactDTO>> GetAllContactsAsync(string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);

            var contacts = await _context.Contacts
                .Include(c => c.FirstMember)
                .Include(c => c.SecondMember)
                .Include(c => c.PinnedMessage)
                .Where(c => c.FirstMemberId == user.Id || c.SecondMemberId == user.Id)
                .ToListAsync();
            var dtoContacts = _mapper.Map<IEnumerable<ContactDTO>>(contacts);
            dtoContacts = dtoContacts.GroupJoin(_context.ContactSettings,
                c => c.Id, s => s.ContactId, (c, s) =>
                {
                    c.Settings = _mapper.Map<ContactSettingDTO>(s.FirstOrDefault( ss => ss.UserId == user.Id));
                    c.ContactnerSettings = _mapper.Map<ContactSettingDTO>(s.FirstOrDefault(ss => ss.UserId != user.Id));
                    return c;
                });

            return dtoContacts;
        }

        public async Task<ContactDTO> GetContactAsync(Guid contactId, string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);

            var contact = await _context.Contacts
                .Include(c => c.FirstMember)
                .Include(c => c.SecondMember)
                .Include(c => c.PinnedMessage)
                .FirstOrDefaultAsync(c => c.Id == contactId);
            if (contact == null) throw new Exception("No such contact");
            var dtoContact = _mapper.Map<ContactDTO>(contact);
            var settings = _context.ContactSettings.Where(s => s.ContactId == contactId);
            dtoContact.Settings = _mapper.Map<ContactSettingDTO>(
                await settings.FirstOrDefaultAsync(s => s.UserId == user.Id));
            dtoContact.ContactnerSettings = _mapper.Map<ContactSettingDTO>(
                await settings.FirstOrDefaultAsync(s => s.UserId != user.Id));
            return dtoContact;
        }

        public async Task UpdateContactAsync(ContactEditDTO contactDTO, string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);

            var entity = _context.Contacts.FirstOrDefault(c => c.Id == contactDTO.Id);

            if (entity == null) throw new Exception("No such contact");

            entity.PinnedMessageId = contactDTO.PinnedMessageId;

            var settingsEntity = await _context.ContactSettings.FirstOrDefaultAsync(s => s.UserId == user.Id && s.ContactId == contactDTO.Id);
            
            settingsEntity.IsBloked = contactDTO.Settings.IsBloked;
            settingsEntity.IsMuted = contactDTO.Settings.IsMuted;

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
            if(ownerEmail == contactnerEmail)
                throw new Exception("You cannot add yourself to contacts");
            var owner = await _context.Users.FirstOrDefaultAsync(u => u.Email == ownerEmail);
            var contactner = await _context.Users.FirstOrDefaultAsync(u => u.Email == contactnerEmail);
            if (owner is null)
                throw new Exception("Owner invalid");
            if (contactner is null)
                throw new Exception("Contactner invalid");

            var contact = await _context.Contacts
                .FirstOrDefaultAsync(c =>
                (c.FirstMemberId == contactner.Id && c.SecondMemberId == owner.Id) || 
                (c.SecondMemberId == contactner.Id && c.FirstMemberId == owner.Id));
            if (contact is object)
                throw new Exception("Such contact is already exist");

            contact = new Contact()
            {
                FirstMemberId = owner.Id,
                SecondMemberId = contactner.Id
            };
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            Console.WriteLine(contact.Id);
            var ownerSettings = new ContactSetting()
            {
                ContactId = contact.Id,
                UserId = owner.Id,
                IsBloked = false,
                IsMuted = false
            };
            var contactnerSettings = new ContactSetting()
            {
                ContactId = contact.Id,
                UserId = contactner.Id,
                IsBloked = false,
                IsMuted = false
            };
            _context.ContactSettings.Add(ownerSettings);
            _context.ContactSettings.Add(contactnerSettings);
            await _context.SaveChangesAsync();
            return await GetContactAsync(contact.Id, ownerEmail);
        }
    }
}
