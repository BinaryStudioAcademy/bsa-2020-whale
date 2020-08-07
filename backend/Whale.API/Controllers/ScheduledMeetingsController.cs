using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Whale.BLL.Services.Interfaces;
using Whale.Shared.DTO.Meeting.ScheduledMeeting;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduledMeetingController : ControllerBase
    {
        private readonly IScheduledMeetingsService _scheduledMeetingService;

        public ScheduledMeetingController(IScheduledMeetingsService scheduledMeetingService)
        {
            _scheduledMeetingService = scheduledMeetingService;
        }

        [HttpGet("{Id}", Name = "ScheduledGet")]
        public async Task<IActionResult> GetAsync(Guid Id)
        {
            try
            {
                return Ok(await _scheduledMeetingService.GetAsync(Id));
            }
            catch (Exception e)
            {
                return NotFound(e.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] ScheduledMeetingCreateDTO scheduled)
        {
            var createdContact = await _scheduledMeetingService.PostAsync(scheduled);
            return CreatedAtRoute("ScheduledGet", new { createdContact.Id }, createdContact);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromBody] ScheduledMeetingDTO scheduled)
        {
            return Ok(await _scheduledMeetingService.UpdateAsync(scheduled));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync(Guid id)
        {
            try
            {
                await _scheduledMeetingService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception e)
            {
                return NotFound(e.Message);
            }
        }
    }
}
