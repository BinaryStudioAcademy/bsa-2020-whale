using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
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
			var participants2 = await _context.Participants
				.Where(p => p.UserId == userId)
				.Skip(skip)
				.Take(take)
				.ToListAsync();

			var userMeetingsIds = participants2.Select(p => p.MeetingId);

			var meetings = await _context.Meetings
				.Where(m => userMeetingsIds.Contains(m.Id))
				.ToListAsync();

			var meetingsTasks = meetings
				.GroupJoin(
					_context.PollResults,
					m => m.Id,
					pR => pR.MeetingId,
					(m, pRGroup) => new Meeting(m, pRGroup)
				)
				.GroupJoin(
					_context.Participants.Include(p => p.User),
					m => m.Id,
					p => p.MeetingId,
					(m, pGroup) => new Meeting(m, pGroup)
				)
				.Select(async m =>
				{
					m.Participants = await m.Participants.LoadAvatarsAsync(_blobStorageSettings, p => p.User);
					return m;
				});

			meetings = (await Task.WhenAll(meetingsTasks)).ToList();

			return _mapper.Map<IEnumerable<MeetingDTO>>(meetings);
		}
	}
}
