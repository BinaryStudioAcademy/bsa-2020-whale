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
using Whale.Shared.Models.Group;
using Whale.Shared.Models.Group.GroupUser;
using Whale.Shared.Models.User;
using Microsoft.AspNetCore.SignalR.Client;

namespace Whale.Shared.Services
{
    public class GroupService : BaseService
    {
        private UserService _userService;
        private SignalrService _signalrService;
        public GroupService(WhaleDbContext context, IMapper mapper, UserService userService, SignalrService signalrService) : base(context, mapper)
        {
            this._userService = userService;
            this._signalrService = signalrService;
        }
        public async Task<IEnumerable<GroupDTO>> GetAllGroupsAsync(string userEmail)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user is null)
                throw new NotFoundException("User", userEmail);

            var userGroups = await _context.GroupUsers
                .Include(g => g.User)
                .Include(g => g.Group)
                    .ThenInclude(g => g.PinnedMessage)
                .Where(g => g.UserId == user.Id)
                .Select(g => g.Group)
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

        public async Task<GroupDTO> GetGroupAsync(Guid groupId)
        {
            var group = await _context.Groups
                   .Include(g => g.PinnedMessage)
               .FirstOrDefaultAsync(c => c.Id == groupId);

            if (group == null)
                throw new NotFoundException("Group", groupId.ToString());

            return _mapper.Map<GroupDTO>(group);
        }

        public async Task<GroupDTO> UpdateGroup(UpdateGroupDTO updateGroup)
        {
            var group = _context.Groups.FirstOrDefault(g => g.Id == updateGroup.Id);

            if (group == null) throw new NotFoundException("Group", updateGroup.Id.ToString());

            var userInGroup = await _context.GroupUsers
                .Include(gu => gu.User)
                .FirstOrDefaultAsync(u => u.User.Email == updateGroup.CreatorEmail && u.GroupId == updateGroup.Id);
            if (userInGroup is null)
                throw new NotFoundException("User in group", updateGroup.CreatorEmail);

            group.CreatorEmail = updateGroup.CreatorEmail;
            group.Label = updateGroup.Label;
            group.Description = updateGroup.Description;
            group.PhotoUrl = updateGroup.PhotoUrl;

            _context.Groups.Update(group);
            await _context.SaveChangesAsync();

            return await GetGroupAsync(group.Id);
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

            if (group == null)
                throw new NotFoundException("Group", id.ToString());

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

            var connection = await _signalrService.ConnectHubAsync("whale");
            await connection.InvokeAsync("OnDeleteGroup", id, userGroups);

            return true;
        }

        public async Task<bool> RemoveUserFromGroup(Guid groupId, string userEmail)
        {
            var group = _context.Groups.FirstOrDefault(c => c.Id == groupId);
            if (group is null) return false;

            var user = _context.Users.FirstOrDefault(c => c.Email == userEmail);
            if (user is null) return false;

            if (group.CreatorEmail == userEmail) 
                throw new Exception("You cannot leave the group because you are administrator. Please, assign someone else.");

            var userInGroup = await _context.GroupUsers
               .Include(g => g.User)
               .Include(g => g.Group)
               .FirstOrDefaultAsync(g => g.UserId == user.Id && g.GroupId == group.Id);

            _context.GroupUsers.Remove(userInGroup);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<UserDTO>> GetAllUsersInGroupAsync(Guid groupId)
        {
            var user = await _context.Groups.FirstOrDefaultAsync(u => u.Id == groupId);
            if (user is null)
                throw new NotFoundException("Group", groupId.ToString());

            var users = await _context.GroupUsers
                .Include(g => g.User)
                .Include(g => g.Group)
                    .ThenInclude(g => g.PinnedMessage)
                .Where(g => g.GroupId == groupId)
                .Select(g => g.User)
                .ToListAsync();

            if (users is null)
                throw new Exception("No users in group");

            return _mapper.Map<IEnumerable<UserDTO>>(users);
        }

        public async Task<GroupUserDTO> AddUserToGroupAsync(GroupUserCreateDTO groupUser)
        {
            var group = _context.Groups.FirstOrDefault(c => c.Id == groupUser.GroupId);
            if (group is null)
                throw new NotFoundException("Group", groupUser.GroupId.ToString());

            var groupDTO = _mapper.Map<GroupDTO>(group);

            var user = _context.Users.FirstOrDefault(c => c.Email == groupUser.UserEmail);
            if (user is null)
                throw new NotFoundException("User", groupUser.UserEmail);

            var userInGroup = await _context.GroupUsers
               .Include(g => g.User)
               .Include(g => g.Group)
               .FirstOrDefaultAsync(g => g.UserId == user.Id && g.GroupId == group.Id);

            if (userInGroup is object)
                throw new AlreadyExistsException("User");

            var GroupUserDTO = new GroupUserDTO { GroupId = groupUser.GroupId, UserId = user.Id };

            var newUserInGroup = _mapper.Map<GroupUser>(GroupUserDTO);
            _context.GroupUsers.Add(newUserInGroup);
            await _context.SaveChangesAsync();

            var connection = await _signalrService.ConnectHubAsync("whale");
            await connection.InvokeAsync("OnNewGroup", groupDTO, user.Id);

            return _mapper.Map<GroupUserDTO>(newUserInGroup);
        }

    }
}
