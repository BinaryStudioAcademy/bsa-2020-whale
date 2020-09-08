using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Models.ScheduledMeeting;
using Whale.API.Services;
using Whale.Shared.Models.User;

namespace Whale.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ScheduledMeetingController : ControllerBase
    {
        private readonly ScheduledMeetingsService _scheduledMeetingService;

        public ScheduledMeetingController(ScheduledMeetingsService scheduledMeetingService)
        {
            _scheduledMeetingService = scheduledMeetingService;
        }

        [HttpGet("{Id}", Name = "ScheduledGet")]
        public async Task<ActionResult<ScheduledMeetingDTO>> GetAsync(Guid Id)
        {
            return Ok(await _scheduledMeetingService.GetAsync(Id));
        }

        [HttpGet("participants/{id}")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetParticipantsAsync(Guid Id)
        {
            return Ok(await _scheduledMeetingService.GetParticipantsAsync(Id));
        }

        [Authorize]
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<ScheduledDTO>>> GetAllAsync(int skip, int take)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            return Ok(await _scheduledMeetingService.GetAllScheduledAsync(ownerEmail, skip, take));
        }

        [Authorize]
        [HttpGet("upcomming")]
        public async Task<ActionResult<IEnumerable<ScheduledDTO>>> GetUpcomingAsync(int skip, int take)
        {
            var ownerEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            return Ok(await _scheduledMeetingService.GetUpcomingScheduledAsync(ownerEmail, skip, take));
        }

        [HttpPost]
        public async Task<ActionResult<ScheduledMeetingDTO>> CreateAsync([FromBody] ScheduledMeetingCreateDTO scheduled)
        {
            var createdContact = await _scheduledMeetingService.PostAsync(scheduled);
            return CreatedAtRoute("ScheduledGet", new { createdContact.Id }, createdContact);
        }

        [HttpPut]
        public async Task<ActionResult<ScheduledMeetingDTO>> UpdateAsync([FromBody] ScheduledMeetingDTO scheduled)
        {
            return Ok(await _scheduledMeetingService.UpdateAsync(scheduled));
        }

        [HttpPut("cancel")]
        public async Task<ActionResult<ScheduledMeetingDTO>> CancelScheduledMeetingAsync([FromBody] CancelMeetingDTO dto)
        {
            var applicantEmail = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            await _scheduledMeetingService.CancelScheduledMeetingAsync(dto.ScheduledMeetingId, applicantEmail);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync(Guid id)
        {
            await _scheduledMeetingService.DeleteAsync(id);
            return NoContent();
        }
    }
}
