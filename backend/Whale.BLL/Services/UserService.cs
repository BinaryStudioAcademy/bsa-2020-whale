using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Whale.BLL.Services.Abstract;
using Whale.BLL.Services.Interfaces;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.DTO.User;

namespace Whale.BLL.Services
{
    public class UserService:BaseService, IUserService
    {
        public UserService(WhaleDbContext context, IMapper mapper) : base(context, mapper)
        {
        }

        public async Task<UserDTO> GetUserAsync(Guid userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(c => c.Id == userId);

            if (user == null) throw new Exception("No such user");

            return _mapper.Map<UserDTO>(user);
        }

        public async Task<UserDTO> CreateUserAsync(UserCreateDTO userDTO)
        {
            var entity = _mapper.Map<User>(userDTO);

            var user = _context.Users.FirstOrDefault(c => c.Email == userDTO.Email);

            if (user != null) throw new Exception("Such user is already exist");

            _context.Users.Add(entity);
            await _context.SaveChangesAsync();

            var createdUser = await _context.Users
                .FirstAsync(c => c.Id == entity.Id);

            return _mapper.Map<UserDTO>(createdUser);
        }

        public async Task UpdateUserAsync(UserDTO userDTO)
        {
            var entity = _context.Users.FirstOrDefault(c => c.Id == userDTO.Id);

            if (entity == null) throw new Exception("No such user");

            var user = _mapper.Map<User>(userDTO);

            _context.Users.Update(user);

            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = _context.Users.FirstOrDefault(c => c.Id == userId);

            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
