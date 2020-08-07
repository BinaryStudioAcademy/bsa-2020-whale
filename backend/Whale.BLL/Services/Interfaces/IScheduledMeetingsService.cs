using System;
using System.Threading.Tasks;
using Whale.Shared.DTO.Meeting.ScheduledMeeting;

namespace Whale.BLL.Services.Interfaces
{
    public interface IScheduledMeetingsService
    {
        Task<ScheduledMeetingDTO> GetAsync(Guid uid);
        Task<ScheduledMeetingDTO> PostAsync(ScheduledMeetingCreateDTO scheduledMeeting);
        Task<ScheduledMeetingDTO> UpdateAsync(ScheduledMeetingDTO scheduledMeeting);
        Task DeleteAsync(Guid id);
    }
}
