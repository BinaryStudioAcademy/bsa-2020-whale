using AutoMapper;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Settings;
using Whale.Shared.Exceptions;
using Whale.Shared.Extentions;
using Whale.Shared.Models.Contact;
using Whale.Shared.Models.DirectMessage;
using Whale.Shared.Models.User;
using Whale.Shared.Services.Abstract;

namespace Whale.Shared.Services
{
    public class ContactsService : BaseService
    {
        private readonly NotificationsService _notifications;
        private readonly BlobStorageSettings _blobStorageSettings;
        private readonly SignalrService _signalrService;
        private readonly RedisService _redisService;
        private const string onlineUsersKey = "online";
        public ContactsService(WhaleDbContext context, IMapper mapper, NotificationsService notifications, BlobStorageSettings blobStorageSettings, SignalrService signalrService, RedisService redisService) : base(context, mapper)
        {
            _notifications = notifications;
            _blobStorageSettings = blobStorageSettings;
            _signalrService = signalrService;
            _redisService = redisService;
        }

        public async Task<IEnumerable<ContactDTO>> GetAllContactsAsync(string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var contacts = await _context.Contacts
                 .Include(c => c.FirstMember)
                 .Include(c => c.SecondMember)
                 .Include(c => c.PinnedMessage)
                 .Where(c => c.FirstMemberId == user.Id || (c.SecondMemberId == user.Id && c.isAccepted))
                 .ToListAsync();

            contacts = (await contacts.LoadAvatarsAsync(_blobStorageSettings, c => c.FirstMember)).ToList();
            contacts = (await contacts.LoadAvatarsAsync(_blobStorageSettings, c => c.SecondMember)).ToList();

            var contactsDto = contacts
                .Select(c =>
            {
                var contact = new ContactDTO()
                {
                    Id = c.Id,
                    FirstMemberId = (c.FirstMemberId == user.Id) ? c.FirstMemberId : c.SecondMemberId,
                    FirstMember = _mapper.Map<UserDTO>((c.FirstMemberId == user.Id) ? c.FirstMember : c.SecondMember),
                    SecondMemberId = (c.SecondMemberId == user.Id) ? c.FirstMemberId : c.SecondMemberId,
                    SecondMember = _mapper.Map<UserDTO>((c.SecondMemberId == user.Id) ? c.FirstMember : c.SecondMember),
                    PinnedMessage = _mapper.Map<DirectMessageDTO>(c.PinnedMessage),
                    isAccepted = c.isAccepted,
                };
                contact.FirstMember.ConnectionId = GetConnectionId(contact.FirstMember.Id);
                contact.SecondMember.ConnectionId = GetConnectionId(contact.SecondMember.Id);
                int unreadMessageCount = _context.UnreadMessageIds
                .Where(um => um.ReceiverId == contact.FirstMemberId && _context.DirectMessages
                    .Any(dm => dm.Id == um.MessageId && dm.AuthorId == contact.SecondMemberId))
                .Count();
                contact.UnreadMessageCount = unreadMessageCount;

                return contact;
            });



            return contactsDto;
        }

        public async Task<IEnumerable<ContactDTO>> GetAcceptedContactsAsync(string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var contacts = await _context.Contacts
                 .Include(c => c.FirstMember)
                 .Include(c => c.SecondMember)
                 .Include(c => c.PinnedMessage)
                 .Where(c => c.FirstMemberId == user.Id || (c.SecondMemberId == user.Id && c.isAccepted))
                 .Where(c => c.isAccepted)
                 .ToListAsync();

            contacts = (await contacts.LoadAvatarsAsync(_blobStorageSettings, c => c.FirstMember)).ToList();
            contacts = (await contacts.LoadAvatarsAsync(_blobStorageSettings, c => c.SecondMember)).ToList();

            var contactsDto = contacts
                .Select(c =>
                {
                    var contact = new ContactDTO()
                    {
                        Id = c.Id,
                        FirstMemberId = (c.FirstMemberId == user.Id) ? c.FirstMemberId : c.SecondMemberId,
                        FirstMember = _mapper.Map<UserDTO>((c.FirstMemberId == user.Id) ? c.FirstMember : c.SecondMember),
                        SecondMemberId = (c.SecondMemberId == user.Id) ? c.FirstMemberId : c.SecondMemberId,
                        SecondMember = _mapper.Map<UserDTO>((c.SecondMemberId == user.Id) ? c.FirstMember : c.SecondMember),
                        PinnedMessage = _mapper.Map<DirectMessageDTO>(c.PinnedMessage),
                        isAccepted = c.isAccepted,
                    };
                    contact.FirstMember.ConnectionId = GetConnectionId(contact.FirstMember.Id);
                    contact.SecondMember.ConnectionId = GetConnectionId(contact.SecondMember.Id);
                    return contact;
                });

            return contactsDto;
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
                .FirstOrDefaultAsync(c => c.Id == contactId);
            if (contact == null) throw new NotFoundException("Contact", contactId.ToString());

            await contact.FirstMember.LoadAvatarAsync(_blobStorageSettings);
            await contact.SecondMember.LoadAvatarAsync(_blobStorageSettings);
            var dtoContact = new ContactDTO()
            {
                Id = contact.Id,
                FirstMemberId = (contact.FirstMemberId == user.Id) ? contact.FirstMemberId : contact.SecondMemberId,
                FirstMember = _mapper.Map<UserDTO>((contact.FirstMemberId == user.Id) ? contact.FirstMember : contact.SecondMember),
                SecondMemberId = (contact.SecondMemberId == user.Id) ? contact.FirstMemberId : contact.SecondMemberId,
                SecondMember = _mapper.Map<UserDTO>((contact.SecondMemberId == user.Id) ? contact.FirstMember : contact.SecondMember),
                PinnedMessage = _mapper.Map<DirectMessageDTO>(contact.PinnedMessage),
                isAccepted = contact.isAccepted,
            };
            dtoContact.FirstMember.ConnectionId = GetConnectionId(contact.FirstMember.Id);
            dtoContact.SecondMember.ConnectionId = GetConnectionId(contact.SecondMember.Id);

            return dtoContact;
        }

        public async Task<ContactDTO> UpdateContactAsync(ContactEditDTO contactDTO, string userEmail)
        {
            var entity = _context.Contacts
                .Include(c => c.FirstMember)
                .Include(c => c.SecondMember)
                .FirstOrDefault(c => c.Id == contactDTO.Id);

            if (entity.FirstMember.Email != userEmail && entity.SecondMember.Email != userEmail)
                throw new InvalidCredentials();
            if (entity == null)
                throw new NotFoundException("Contact", contactDTO.Id.ToString());
            entity.PinnedMessageId = contactDTO.PinnedMessageId;
            _context.Contacts.Update(entity);
            await _context.SaveChangesAsync();
            return await GetContactAsync(entity.Id, userEmail);
        }

        public async Task<bool> DeleteContactAsync(Guid contactId, string userEmail)
        {
            var contact = _context.Contacts
                .Include(c => c.FirstMember)
                .Include(c => c.SecondMember)
                .FirstOrDefault(c => c.Id == contactId);

            if (contact.FirstMember.Email != userEmail && contact.SecondMember.Email != userEmail)
                throw new InvalidCredentials();

            if (contact == null) return false;

            var contactnerEmail = userEmail == contact.FirstMember.Email ? contact.SecondMember.Email : contact.FirstMember.Email;

            var messages = _context.DirectMessages.Where(m => m.ContactId == contactId);
            _context.DirectMessages.RemoveRange(messages);
            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();
            var connection = await _signalrService.ConnectHubAsync("whale");
            await connection.InvokeAsync("onDeleteContact", contact);
            await _notifications.AddTextNotification(contactnerEmail, userEmail + " removed you from contacts.");
            return true;
        }
        public async Task<bool> DeletePendingContactByEmailAsync(string contactnerEmail, string userEmail)
        {
            var contact = _context.Contacts
                .Include(c => c.FirstMember)
                .Include(c => c.SecondMember)
                .FirstOrDefault(c => ((c.FirstMember.Email == contactnerEmail && c.SecondMember.Email == userEmail) ||
                    (c.FirstMember.Email == userEmail && c.SecondMember.Email == contactnerEmail)) && !c.isAccepted);

            if (contact == null)
                throw new NotFoundException("Pending Contact", contactnerEmail);
            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();
            var connection = await _signalrService.ConnectHubAsync("whale");
            await connection.InvokeAsync("onDeleteContact", contact);
            if (contact.SecondMember.Email == userEmail)
                await _notifications.AddTextNotification(contactnerEmail, userEmail + " rejected your request.");
            else
                await _notifications.DeleteNotificationPendingContactAsync(userEmail, contactnerEmail);
            return true;
        }
        public async Task<ContactDTO> CreateContactFromEmailAsync(string ownerEmail, string contacterEmail)
        {
            if (ownerEmail == contacterEmail)
                throw new BaseCustomException("You cannot add yourself to contacts");
            var owner = await _context.Users.FirstOrDefaultAsync(u => u.Email == ownerEmail);
            var contactner = await _context.Users.FirstOrDefaultAsync(u => u.Email == contacterEmail);
            if (owner is null)
                throw new NotFoundException("Owner", ownerEmail);
            if (contactner is null)
                throw new NotFoundException("Contacter", contacterEmail);

            var contact = await _context.Contacts
                .Include(c => c.FirstMember)
                .Include(c => c.SecondMember)
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
                    var contactOwnerDTO = await GetContactAsync(contact.Id, ownerEmail);
                    var contactContactnerEmailDTO = await GetContactAsync(contact.Id, contacterEmail);
                    var connection = await _signalrService.ConnectHubAsync("whale");
                    await connection.InvokeAsync("onNewContact", contactOwnerDTO);
                    await connection.InvokeAsync("onNewContact", contactContactnerEmailDTO);
                    return contactOwnerDTO;
                }
                throw new AlreadyExistsException("Contact");
            }

            contact = new Contact()
            {
                FirstMemberId = owner.Id,
                SecondMemberId = contactner.Id,
                isAccepted = false,
            };
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            await _notifications.AddContactNotification(ownerEmail, contacterEmail);
            return await GetContactAsync(contact.Id, ownerEmail);
        }

        private string GetConnectionId(Guid userId)
        {
            _redisService.Connect();
            try
            {
                var onlineUsers = _redisService.Get<ICollection<UserOnlineDTO>>(onlineUsersKey);
                var userOnline = onlineUsers.FirstOrDefault(u => u.Id == userId);
                return userOnline?.ConnectionId;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
