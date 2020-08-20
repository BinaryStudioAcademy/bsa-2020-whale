using AutoMapper;
using Whale.DAL.Models;
using Whale.Shared.Models.Notification;

namespace Whale.Shared.MappingProfiles
{
    public class NotificationProfile : Profile
    {
        public NotificationProfile()
        {
            CreateMap<Notification, NotificationDTO>();
        }
    }
}
