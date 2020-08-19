namespace Whale.Shared.Exceptions
{
    public sealed class NotFoundException : BaseCustomException
    {
        public NotFoundException(string name, string id)
            : base($"Entity {name} with id ({id}) was not found.")
        {
            _httpError = 404;
        }
        public NotFoundException(string name) : base($"Entity {name} was not found.")
        {
            _httpError = 404;
        }
    }
}
