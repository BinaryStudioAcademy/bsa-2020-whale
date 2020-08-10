using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Whale.BLL.Exceptions;
using Whale.BLL.Hubs;
using Whale.BLL.Services.Abstract;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.Shared.DTO.Poll;
using Whale.Shared.Helpers;

namespace Whale.BLL.Services
{
	public class PollService : BaseService
	{
		private readonly IHubContext<PollHub> _pollHub;

		public PollService(WhaleDbContext context, IMapper mapper, IHubContext<PollHub> pollHub) 
			: base(context, mapper) 
		{
			_pollHub = pollHub;
		}

		public async Task<PollDTO> GetPollByMeetingId(Guid meetingId)
		{
			Poll poll = await _context.Polls.FirstOrDefaultAsync(poll => poll.MeetingId == meetingId);

			return _mapper.Map<PollDTO>(poll);
		}

		public async Task<PollDTO> CreatePoll(PollDTO pollDto)
		{
			Poll pollEntity = _mapper.Map<Poll>(pollDto);

			if(!_context.Meetings.Any(meeting => meeting.Id == pollDto.MeetingId))
			{
				throw new NotFoundException(nameof(Meeting));
			}

			// validate properties
			await ValidationHelper.ValidateProperties<Poll>(pollEntity);

			await _context.AddAsync(pollEntity);
			await _context.SaveChangesAsync();

			//_pollHub.Clients.Groups
			await _pollHub.Clients.Group(pollEntity.MeetingId.ToString()).SendAsync("Poll", pollDto);

			return pollDto;
		}
	}
}
