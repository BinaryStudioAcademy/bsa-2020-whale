using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.DAL;
using Whale.DAL.Models;
using Whale.DAL.Settings;
using Whale.Shared.Exceptions;
using Whale.Shared.Extentions;
using Whale.Shared.Models.Participant;
using Whale.Shared.Services.Abstract;

namespace Whale.Shared.Services
{
    public class ParticipantService : BaseService
    {
        private readonly BlobStorageSettings _blobStorageSettings;

        public ParticipantService(WhaleDbContext context, IMapper mapper, BlobStorageSettings blobStorageSettings) : base(context, mapper)
        {
            _blobStorageSettings = blobStorageSettings;
        }

        public async Task<ParticipantDTO> CreateParticipantAsync(ParticipantCreateDTO participantDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == participantDto.UserEmail);
            if (user == null)
                throw new NotFoundException("User");

            var meeting = await _context.Meetings.FirstOrDefaultAsync(m => m.Id == participantDto.MeetingId);
            if (meeting == null)
                throw new NotFoundException("Meeting");

            var entity = _mapper.Map<Participant>(participantDto);
            entity.UserId = user.Id;

            await _context.Participants.AddAsync(entity);
            await _context.SaveChangesAsync();

            var createdParticipant = await _context.Participants
                .Include(p => p.User)
                .Include(p => p.Meeting)
                .FirstOrDefaultAsync(p => p.Id == entity.Id);

            await createdParticipant.User.LoadAvatarAsync(_blobStorageSettings);

            return _mapper.Map<ParticipantDTO>(createdParticipant);
        }

        public async Task UpdateParticipantAsync(ParticipantUpdateDTO participantDto)
        {
            var entity = await _context.Participants.FirstOrDefaultAsync(p => p.Id == participantDto.Id);

            if (entity == null)
                throw new NotFoundException("Participant");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == participantDto.UserId);
            if (user == null)
                throw new NotFoundException("User");

            var meeting = await _context.Meetings.FirstOrDefaultAsync(m => m.Id == participantDto.MeetingId);
            if (meeting == null)
                throw new NotFoundException("Meeting");

            var participant = _mapper.Map<Participant>(participantDto);

            _context.Participants.Update(participant);

            await _context.SaveChangesAsync();
        }

        public async Task DeleteParticipantAsync(Guid id)
        {
            var participant = await _context.Participants.FirstOrDefaultAsync(p => p.Id == id);

            if (participant == null)
                throw new NotFoundException("Participant");

            _context.Participants.Remove(participant);
            await _context.SaveChangesAsync();
        }

        public async Task<ParticipantDTO> GetParticipantAsync(Guid id)
        {
            var participant = await _context.Participants
                .Include(p => p.User)
                .Include(p => p.Meeting)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (participant == null)
                throw new NotFoundException("Participant");

            await participant.User.LoadAvatarAsync(_blobStorageSettings);

            return _mapper.Map<ParticipantDTO>(participant);
        }

        public async Task<IEnumerable<ParticipantDTO>> GetMeetingParticipantsAsync(Guid meetingId)
        {
            var meeting = await _context.Meetings.FirstOrDefaultAsync(m => m.Id == meetingId);
            if (meeting == null)
                throw new NotFoundException("Meeting");

            var participants = await _context.Participants
                .Include(p => p.User)
                .Include(p => p.Meeting)
                .Where(p => p.MeetingId == meetingId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ParticipantDTO>>(await participants.LoadAvatarsAsync(_blobStorageSettings, p => p.User));
        }

        public async Task<ParticipantDTO> GetMeetingParticipantByEmail(Guid meetingId, string email)
        {
            var participants = await GetMeetingParticipantsAsync(meetingId);
            return participants.FirstOrDefault(p => p.User.Email == email);
        }
    }
}
