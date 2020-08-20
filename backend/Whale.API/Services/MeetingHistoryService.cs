using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.Models.Meeting;

namespace Whale.API.Services
{
	public class MeetingHistoryService : BaseService
	{
		public MeetingHistoryService(WhaleDbContext context, IMapper mapper)
			: base(context, mapper)
		{ }

		public async Task<IEnumerable<MeetingDTO>> GetMeetingsWithParticipantsAndPollResults(Guid userId)
		{
			var participants2 = await _context.Participants
				.Where(p => p.UserId == userId)
				.ToListAsync();

			var userMeetingsIds = participants2.Select(p => p.MeetingId);

			var meetings = await _context.Meetings
				.Where(m => userMeetingsIds.Contains(m.Id))
				.ToListAsync();

			meetings = meetings
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
				.ToList();

			return _mapper.Map<IEnumerable<MeetingDTO>>(meetings);
		}
	}
}
