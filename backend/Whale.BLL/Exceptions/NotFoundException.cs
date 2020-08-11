using System;

namespace Whale.BLL.Exceptions
{
    public sealed class NotFoundException : BaseCustomException
    {
        public NotFoundException(string name, string id, bool isLogged = false)
            : base($"Entity {name} with id ({id}) was not found.", isLogged)
        {
            _httpError = 404;
        }
        public NotFoundException(string name, bool isLogged = false) : base($"Entity {name} was not found.", isLogged)
        {
            _httpError = 404;
        }
    }
}
