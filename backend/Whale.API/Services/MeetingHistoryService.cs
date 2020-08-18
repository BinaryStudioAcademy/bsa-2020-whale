using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Poll;
using Whale.Shared.DTO.Meeting;
using Whale.Shared.DTO.Poll;

namespace Whale.API.Services
{
	public class MeetingHistoryService : BaseService
	{
		public MeetingHistoryService(WhaleDbContext context, IMapper mapper)
			: base(context, mapper)
		{ }

		public async Task<IEnumerable<MeetingDTO>> GetMeetingsWithParticipantsAndPollResults(Guid userId)
		{
			var meetings = await _context.Meetings.ToListAsync();
			var participants = await _context.Participants.Include(p => p.User).ToListAsync();

			var pollResults = await _context.PollResults
				.Include(pR => pR.OptionResults)
					.ThenInclude(oR => oR.VotedUsers)
				.ToListAsync();

			foreach (var result in pollResults)
			{
				if (result.IsAnonymous)
				{
					foreach (var optionResult in result.OptionResults)
					{
						optionResult.VotedUsers = new List<Voter>();
					}
				}
			}

			var meetingsConnected = meetings
				.GroupJoin(
					pollResults,
					m => m.Id,
					pR => pR.MeetingId,
					(m, pRGroup) => new Meeting(m, pRGroup)
				)
				.GroupJoin(
					participants,
					m => m.Id,
					p => p.MeetingId,
					(m, pGroup) => new Meeting(m, pGroup)
				)
				.Where(m => m.Participants.Any(p => p.UserId == userId))
				.ToList();

			foreach (var meeting in meetingsConnected)
			{
				foreach (var result in meeting.PollResults)
				{
					foreach (var optionResult in result.OptionResults)
					{
						foreach(var voter in optionResult.VotedUsers)
						{
							var user = _context.Users.FirstOrDefault(user => user.Email == voter.Email);
							voter.FirstName = user.FirstName;
							voter.SecondName = user.SecondName;
							voter.AvatarUrl = user.AvatarUrl;
						}
					}
				}
			}

			return _mapper.Map<IEnumerable<MeetingDTO>>(meetingsConnected);
		}
	}
}
