using System;

namespace Whale.Shared.DTO.Meeting.MeetingMessage
{
    public class MeetingMessageDTO
    {
        public Guid Id { get; set; }
        public Guid AuthorId { get; set; }
        public string Message { get; set; }
        public DateTime SentDate { get; set; }
    }
}