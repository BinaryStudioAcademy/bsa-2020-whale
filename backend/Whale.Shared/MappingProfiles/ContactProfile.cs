using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.Models.Contact;

namespace Whale.Shared.MappingProfiles
{
    public class ContactProfile : Profile
    {
        public ContactProfile()
        {
            CreateMap<Contact, ContactDTO>().ReverseMap();
            CreateMap<Contact, ContactEditDTO>().ReverseMap();
        }
    }
}
