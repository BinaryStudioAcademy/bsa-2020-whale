using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Whale.Shared.DTO.User;
using Whale.Shared.Models;

namespace Whale.BLL.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDTO>> GetAllUsers();
        Task<UserDTO> GetUserAsync(Guid userId);
        Task<UserDTO> GetUserByEmail(string email);
        Task<UserDTO> CreateUserAsync(UserCreateDTO userDTO);
        Task<UserDTO> CreateUser(UserModel user);
        Task UpdateUserAsync(UserDTO userDTO);
        Task<bool> DeleteUserAsync(Guid userId);
    }
}
