using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Whale.BLL.Exceptions;
using Whale.BLL.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.DTO.Group;

namespace Whale.BLL.Services
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

            var userGroups = _context.GroupUsers
                .Include(g => g.User)
                .Include(g => g.Group)
                    .ThenInclude(g=>g.PinnedMessage)
                .Where(g => g.UserId == user.Id)
                .Select(g=>g.Group)
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
               .FirstOrDefaultAsync(c => c.Id == groupId && c.UserId == user.Id);

            if (userGroup == null)
                throw new NotFoundException("Group", groupId.ToString());

            return _mapper.Map<GroupDTO>(userGroup.Group);
        }

        public async Task CreateGroupAsync(GroupCreateDTO newGroup)
        {
            //var group = await _context.Groups
            //    .FirstOrDefaultAsync(c =>
            //    (c.Label == newGroup.Label));
            //if (group is object)
            //    throw new AlreadyExistsException("Contact");
            //_context.Groups.Add(_mapper.Map<Group>(newGroup));
            //await _context.SaveChangesAsync();
            //return await GetGroupAsync(group.Id);

        }
    }
}
