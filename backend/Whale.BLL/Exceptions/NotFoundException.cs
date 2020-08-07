using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.BLL.Exceptions
{
    public sealed class NotFoundException : Exception
    {
<<<<<<< HEAD
        public NotFoundException(string name, int id)
=======
        public NotFoundException(string name, Guid id)
>>>>>>> feature/meeting
            : base($"Entity {name} with id ({id}) was not found.")
        {
        }

        public NotFoundException(string name) : base($"Entity {name} was not found.") { }
    }
}
