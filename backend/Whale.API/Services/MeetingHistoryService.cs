using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.API.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Models.Poll;
using Whale.DAL.Settings;
using Whale.Shared.Exceptions;
using Whale.Shared.Extentions;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.User;

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
				.Where(p => p.UserId == userId && p.Meeting.EndTime != null)
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
		public async Task<IEnumerable<MeetingSpeechDTO>> GetMeetingScript(Guid meetingId)
        {
			var scriptJson = await _context.MeetingScripts.FirstOrDefaultAsync(m => m.MeetingId == meetingId);
			if (scriptJson is null)
				throw new NotFoundException("MeetingScripts", meetingId.ToString());
			var script = JsonConvert.DeserializeObject<IEnumerable<MeetingSpeech>>(scriptJson.Script);
			var scriptTasks = script.OrderBy(m => m.SpeechDate).Join(_context.Users, m => m.UserId, u => u.Id,
				async (m, u) => new MeetingSpeechDTO
				{
					User = _mapper.Map<UserDTO>(await u.LoadAvatarAsync(_blobStorageSettings)),
					Message = m.Message,
					SpeechDate = m.SpeechDate
				}
			);
			return (await Task.WhenAll(scriptTasks)).ToList();
		}
	}
}
