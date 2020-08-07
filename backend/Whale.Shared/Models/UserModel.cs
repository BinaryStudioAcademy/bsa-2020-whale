using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.Shared.Models
{
    public class UserModel
    {
        [Required]
        public string DisplayName { get; set; }
        public string PhotoUrl { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        public string Phone { get; set; }
    }
}
