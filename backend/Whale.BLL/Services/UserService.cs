using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.BLL.Services.Abstract;
using Whale.BLL.Services.Interfaces;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.DTO.User;
using Whale.Shared.Models;

namespace Whale.BLL.Services
{
    public class UserService:BaseService, IUserService
    {
        public UserService(WhaleDbContext context, IMapper mapper) : base(context, mapper)
        {
        }

        public async Task<IEnumerable<UserDTO>> GetAllUsers()
        {
            return _mapper.Map<IEnumerable<UserDTO>>(await _context.Users.ToListAsync());
        }

        public async Task<UserDTO> GetUserAsync(Guid userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(c => c.Id == userId);

            if (user == null) throw new Exception("No such user");

            return _mapper.Map<UserDTO>(user);
        }

        public async Task<UserDTO> GetUserByEmail(string email)
        {
            return _mapper.Map<UserDTO>(await _context.Users.FirstOrDefaultAsync(e => e.Email == email));
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

        public async Task<UserDTO> CreateUser(UserModel user)
        {
            var checkUser = _context.Users.Where(e => e.Email == user.Email);

            if (checkUser.Count() > 0)
                return null;

            var newUser = _mapper.Map<User>(user);
            var name = user.DisplayName
                .Split(' ')
                .Select(e => e.Trim())
                .ToList();
            newUser.FirstName = name[0];
            newUser.SecondName = name.Count() > 0 ? name[1] : null;
            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

            return _mapper.Map<UserDTO>(newUser);
        }

        public async Task UpdateUserAsync(UserDTO userDTO)
        {
            var entity = _context.Users.FirstOrDefault(c => c.Id == userDTO.Id);

            if (entity == null) throw new Exception("No such user");

            entity.FirstName = userDTO.FirstName;
            entity.SecondName = userDTO.SecondName;
            entity.Email = userDTO.Email;
            entity.AvatarUrl = userDTO.AvatarUrl;
            entity.RegistrationDate = entity.RegistrationDate;
            entity.Phone = userDTO.Phone;

            _context.Users.Update(entity);

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
