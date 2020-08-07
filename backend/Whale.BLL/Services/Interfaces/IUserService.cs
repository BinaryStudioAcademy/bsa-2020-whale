using System;
using System.Threading.Tasks;
using Whale.Shared.DTO.User;

namespace Whale.BLL.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDTO> GetUserAsync(Guid userId);
        Task<UserDTO> CreateUserAsync(UserCreateDTO userDTO);
        Task UpdateUserAsync(UserDTO userDTO);
        Task<bool> DeleteUserAsync(Guid userId);
    }
}
