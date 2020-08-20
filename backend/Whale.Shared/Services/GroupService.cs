using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Whale.Shared.Exceptions;
using Whale.Shared.Services.Abstract;
using Whale.Shared.Services;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.DTO.Group;

namespace Whale.Shared.Services
{
    public class GroupService: BaseService
    {
        private UserService _userService;
        public GroupService(WhaleDbContext context, IMapper mapper, UserService userService ) : base(context, mapper)
        {
            this._userService = userService;
        }
        public async Task<IEnumerable<GroupDTO>> GetAllGroupsAsync(string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var userGroups = await _context.GroupUsers
                .Include(g => g.User)
                .Include(g => g.Group)
                    .ThenInclude(g=>g.PinnedMessage)
                .Where(g => g.UserId == user.Id)
                .Select(g=>g.Group)
                 .OrderBy(c => c.Label)
                .ToListAsync();

            if (userGroups is null)
                throw new Exception("No groups");

            return _mapper.Map<IEnumerable<GroupDTO>>(userGroups);
        }
        public async Task<GroupDTO> GetGroupAsync(Guid groupId, string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var userGroup = await _context.GroupUsers
               .Include(g => g.User)
               .Include(g => g.Group)
                   .ThenInclude(g => g.PinnedMessage)
               .FirstOrDefaultAsync(c => c.GroupId == groupId && c.UserId == user.Id);

            if (userGroup == null)
                throw new NotFoundException("Group", groupId.ToString());

            return _mapper.Map<GroupDTO>(userGroup.Group);
        }

        public async Task<GroupDTO> CreateGroupAsync(GroupCreateDTO newGroup, string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var group = await _context.GroupUsers
                .Include(g => g.User)
                .Include(g => g.Group)
                .FirstOrDefaultAsync(g => g.UserId == user.Id && g.Group.Label == newGroup.Label);

            if (group is object)
                throw new AlreadyExistsException("Group");

            var newCreatedGroup = _mapper.Map<Group>(newGroup);
            _context.Groups.Add(newCreatedGroup);
            _context.GroupUsers.Add(new GroupUser { GroupId = newCreatedGroup.Id, UserId = user.Id });
            await _context.SaveChangesAsync();

            return await GetGroupAsync(newCreatedGroup.Id, userEmail);
        }
        public async Task<bool> DeleteGroupAsync(Guid id)
        {
            var group = _context.Groups.FirstOrDefault(c => c.Id == id);

            if (group == null) return false;

            var userGroups = await _context.GroupUsers
                .Include(g => g.User)
                .Include(g => g.Group)
                .Where(g => g.GroupId == id)
                .ToListAsync();

            var groupMessages = await _context.GroupMessages
                .Where(g => g.GroupId == id)
                .ToListAsync();

            _context.Groups.Remove(group);
            _context.GroupUsers.RemoveRange(userGroups);
            _context.GroupMessages.RemoveRange(groupMessages);
            await _context.SaveChangesAsync();

            return true;
        }

    }
}
