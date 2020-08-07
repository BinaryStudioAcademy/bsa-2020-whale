using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.DTO.Contact;

namespace Whale.BLL.MappingProfiles
{
    public class ContactProfile:Profile
    {
        public ContactProfile()
        {
            CreateMap<Contact, ContactDTO>().ReverseMap();
            CreateMap<Contact, ContactCreateDTO>().ReverseMap();
            CreateMap<Contact, ContactEditDTO>().ReverseMap();
        }
    }
}
