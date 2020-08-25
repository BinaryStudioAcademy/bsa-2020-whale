using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Poll;
using Whale.DAL.Settings;
using Whale.Shared.Extentions;
using Whale.Shared.Models.Meeting;

namespace Whale.API.Services
{
	public class MeetingHistoryService : BaseService
	{
		private readonly BlobStorageSettings _blobStorageSettings;

		public MeetingHistoryService(WhaleDbContext context, IMapper mapper, BlobStorageSettings blobStorageSettings)
			: base(context, mapper)
		{
			_blobStorageSettings = blobStorageSettings;
		}
		public async Task<IEnumerable<MeetingDTO>> GetMeetingsWithParticipantsAndPollResults(Guid userId, int skip, int take)
		{
			var meetings = _context.Participants
				.Include(p => p.Meeting)
				.Where(p => p.UserId == userId)
				.Select(p => p.Meeting)
				.OrderByDescending(m => m.StartTime)
				.Skip(skip)
				.Take(take);

			var meetingTasks = meetings
				.ToList()
				.GroupJoin(
					_context.Participants.Include(p => p.User),
					m => m.Id,
					p => p.MeetingId,
					(m, pGroup) => new Meeting(m, pGroup))
				.GroupJoin(
					_context.PollResults,
					m => m.Id,
					p => p.MeetingId,
					(m, pGroup) => new Meeting(m, pGroup))
				.Select(async m =>
				{
					m.Participants = await m.Participants.LoadAvatarsAsync(_blobStorageSettings, p => p.User);
					return m;
				});

			var meetingList = (await Task.WhenAll(meetingTasks)).ToList();

			return _mapper.Map<IEnumerable<MeetingDTO>>(meetingList);
		}
	}
}
