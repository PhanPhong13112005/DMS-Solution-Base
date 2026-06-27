using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Data;
using RoomBuildingService.Models;

namespace RoomBuildingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemSettingsController : ControllerBase
    {
        private readonly RoomDbContext _context;

        public SystemSettingsController(RoomDbContext context)
        {
            _context = context;
        }

        // GET: api/SystemSettings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SystemSetting>>> GetSystemSettings()
        {
            return await _context.SystemSettings.ToListAsync();
        }

        // GET: api/SystemSettings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SystemSetting>> GetSystemSetting(int id)
        {
            var setting = await _context.SystemSettings.FindAsync(id);

            if (setting == null)
            {
                return NotFound();
            }

            return setting;
        }

        // GET: api/SystemSettings/key/{key}
        [HttpGet("key/{key}")]
        public async Task<ActionResult<SystemSetting>> GetSystemSettingByKey(string key)
        {
            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == key);

            if (setting == null)
            {
                return NotFound();
            }

            return setting;
        }

        // PUT: api/SystemSettings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSystemSetting(int id, SystemSetting systemSetting)
        {
            if (id != systemSetting.Id)
            {
                return BadRequest();
            }

            _context.Entry(systemSetting).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SystemSettingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/SystemSettings
        [HttpPost]
        public async Task<ActionResult<SystemSetting>> PostSystemSetting(SystemSetting systemSetting)
        {
            _context.SystemSettings.Add(systemSetting);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSystemSetting", new { id = systemSetting.Id }, systemSetting);
        }

        // DELETE: api/SystemSettings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSystemSetting(int id)
        {
            var setting = await _context.SystemSettings.FindAsync(id);
            if (setting == null)
            {
                return NotFound();
            }

            _context.SystemSettings.Remove(setting);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SystemSettingExists(int id)
        {
            return _context.SystemSettings.Any(e => e.Id == id);
        }
    }
}
