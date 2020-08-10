using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.DTO.Contact;
using Whale.Shared.DTO.Contact.Setting;

namespace Whale.BLL.MappingProfiles
{
    public class ContactProfile:Profile
    {
        public ContactProfile()
        {
            CreateMap<Contact, ContactDTO>().ReverseMap();
            CreateMap<Contact, ContactEditDTO>().ReverseMap();
            CreateMap<ContactSetting, ContactSettingDTO>().ReverseMap();
        }
    }
}
