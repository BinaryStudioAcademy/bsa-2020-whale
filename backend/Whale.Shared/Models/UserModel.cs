using System.ComponentModel.DataAnnotations;
using Whale.Shared.Enums;

namespace Whale.Shared.Models
{
    public class UserModel
    {
        [Required]
        public string DisplayName { get; set; }
        public string PhotoUrl { get; set; }
        public LinkTypeEnum LinkType { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        public string Phone { get; set; }
    }
}
