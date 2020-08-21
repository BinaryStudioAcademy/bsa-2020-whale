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
			var participants2 = await _context.Participants
				.Include(p => p.Meeting)
				.Where(p => p.UserId == userId)
				.OrderByDescending(p => p.Meeting.StartTime)
				.Skip(skip)
				.Take(take)
				.ToListAsync();

			var meetings = participants2.Select(p => p.Meeting);

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

			foreach (var meeting in meetings)
			{
				foreach (var pollResult in meeting.PollResults)
				{
					if (pollResult.IsAnonymous)
					{
						pollResult.OptionResults.ForEach(oR => oR.VotedUsers = new List<Voter>());
					}
				}
			}

			return _mapper.Map<IEnumerable<MeetingDTO>>(meetings);
		}
	}
}
