using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.Exceptions;
using Whale.Shared.Models.Contact;
using Whale.Shared.Models.Contact.Setting;
using Whale.Shared.Models.DirectMessage;
using Whale.Shared.Models.User;
using Whale.Shared.Services.Abstract;

namespace Whale.Shared.Services
{
    public class ContactsService: BaseService
    {
        private readonly NotificationsService _notifications;
        public ContactsService(WhaleDbContext context, IMapper mapper, NotificationsService notifications) : base(context, mapper)
        {
            _notifications = notifications;
        }

        public async Task<IEnumerable<ContactDTO>> GetAllContactsAsync(string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var contacts = _context.Contacts
                 .Include(c => c.FirstMember)
                 .Include(c => c.SecondMember)
                 .Include(c => c.PinnedMessage)
                 .Include(c => c.FirstMemberSettings)
                 .Include(c => c.SecondMemberSettings)
                 .Where(c => (c.FirstMemberId == user.Id || c.SecondMemberId == user.Id) && c.isAccepted)
                 .Select(c => new ContactDTO()
                 {
                     Id = c.Id,
                     FirstMemberId = (c.FirstMemberId == user.Id) ? c.FirstMemberId : c.SecondMemberId,
                     FirstMember = _mapper.Map<UserDTO>((c.FirstMemberId == user.Id) ? c.FirstMember : c.SecondMember),
                     SecondMemberId = (c.SecondMemberId == user.Id) ? c.FirstMemberId : c.SecondMemberId,
                     SecondMember = _mapper.Map<UserDTO>((c.SecondMemberId == user.Id) ? c.FirstMember : c.SecondMember),
                     PinnedMessage = _mapper.Map<DirectMessageDTO>(c.PinnedMessage),
                     Settings = _mapper.Map<ContactSettingDTO>((c.FirstMemberId == user.Id) ? c.FirstMemberSettings : c.SecondMemberSettings),
                     ContactnerSettings = _mapper.Map<ContactSettingDTO>((c.SecondMemberId == user.Id) ? c.FirstMemberSettings : c.SecondMemberSettings),
                 });

            return contacts;
        }

        public async Task<ContactDTO> GetContactAsync(Guid contactId, string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var contact = await _context.Contacts
                .Include(c => c.FirstMember)
                .Include(c => c.SecondMember)
                .Include(c => c.PinnedMessage)
                .Include(c => c.FirstMemberSettings)
                .Include(c => c.SecondMemberSettings)
                .FirstOrDefaultAsync(c => c.Id == contactId);
            if (contact == null) throw new NotFoundException("Contact", contactId.ToString());
            var dtoContact = new ContactDTO()
            {
                Id = contact.Id,
                FirstMemberId = (contact.FirstMemberId == user.Id) ? contact.FirstMemberId : contact.SecondMemberId,
                FirstMember = _mapper.Map<UserDTO>((contact.FirstMemberId == user.Id) ? contact.FirstMember : contact.SecondMember),
                SecondMemberId = (contact.SecondMemberId == user.Id) ? contact.FirstMemberId : contact.SecondMemberId,
                SecondMember = _mapper.Map<UserDTO>((contact.SecondMemberId == user.Id) ? contact.FirstMember : contact.SecondMember),
                PinnedMessage = _mapper.Map<DirectMessageDTO>(contact.PinnedMessage),
                Settings = _mapper.Map<ContactSettingDTO>((contact.FirstMemberId == user.Id) ? contact.FirstMemberSettings : contact.SecondMemberSettings),
                ContactnerSettings = _mapper.Map<ContactSettingDTO>((contact.SecondMemberId == user.Id) ? contact.FirstMemberSettings : contact.SecondMemberSettings),
            };

            return dtoContact;
        }

        public async Task UpdateContactAsync(ContactEditDTO contactDTO, string userEmail)
        {
            var entity = _context.Contacts.FirstOrDefault(c => c.Id == contactDTO.Id);

            if (entity == null) throw new NotFoundException("Contact", contactDTO.Id.ToString());

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
                throw new BaseCustomException("You cannot add yourself to contacts");
            var owner = await _context.Users.FirstOrDefaultAsync(u => u.Email == ownerEmail);
            var contactner = await _context.Users.FirstOrDefaultAsync(u => u.Email == contactnerEmail);
            if (owner is null)
                throw new NotFoundException("Owner", ownerEmail);
            if (contactner is null)
                throw new NotFoundException("Contactner", contactnerEmail);

            var contact = await _context.Contacts
                .FirstOrDefaultAsync(c =>
                (c.FirstMemberId == contactner.Id && c.SecondMemberId == owner.Id) ||
                (c.SecondMemberId == contactner.Id && c.FirstMemberId == owner.Id));

            if (contact is object)
            {
                if (!contact.isAccepted && contact.SecondMemberId == owner.Id)
                {
                    contact.isAccepted = true;
                    _context.Contacts.Update(contact);
                    await _context.SaveChangesAsync();
                    return await GetContactAsync(contact.Id, ownerEmail);
                }
                throw new AlreadyExistsException("Contact");
            }

            var ownerSettings = new ContactSetting()
            {
                UserId = owner.Id,
                IsBloked = false,
                IsMuted = false
            };
            var contactnerSettings = new ContactSetting()
            {
                UserId = contactner.Id,
                IsBloked = false,
                IsMuted = false
            };
            _context.ContactSettings.Add(ownerSettings);
            _context.ContactSettings.Add(contactnerSettings);
            await _context.SaveChangesAsync();

            contact = new Contact()
            {
                FirstMemberId = owner.Id,
                SecondMemberId = contactner.Id,
                FirstMemberSettings = ownerSettings,
                SecondMemberSettings = contactnerSettings,
                isAccepted = false,
            };
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            await _notifications.AddContactNotification(ownerEmail, contactnerEmail);
            return null;
        }
    }
}
