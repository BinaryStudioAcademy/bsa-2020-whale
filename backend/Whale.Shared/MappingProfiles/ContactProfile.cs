using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.Models.Contact;
using Whale.Shared.Models.Contact.Setting;

namespace Whale.Shared.MappingProfiles
{
    public class ContactProfile: Profile
    {
        public ContactProfile()
        {
            CreateMap<Contact, ContactDTO>().ReverseMap();
            CreateMap<Contact, ContactEditDTO>().ReverseMap();
            CreateMap<ContactSetting, ContactSettingDTO>().ReverseMap();
        }
    }
}
