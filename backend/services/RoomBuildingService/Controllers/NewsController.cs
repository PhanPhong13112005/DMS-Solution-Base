using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Models;
using RoomBuildingService.Data;

namespace RoomBuildingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly RoomDbContext _context;

        public NewsController(RoomDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH TIN TỨC
        // GET: api/News
        [HttpGet]
        public async Task<ActionResult<IEnumerable<News>>> GetNews()
        {
            return await _context.News
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        // 2. LẤY 1 TIN TỨC THEO ID
        // GET: api/News/5
        [HttpGet("{id}")]
        public async Task<ActionResult<News>> GetNewsById(int id)
        {
            var news = await _context.News.FindAsync(id);

            if (news == null)
            {
                return NotFound(new { message = "Không tìm thấy bài tin này." });
            }

            return news;
        }

        // 3. THÊM TIN TỨC MỚI
        // POST: api/News
        // Body JSON: { "title": "...", "content": "...", "author": "..." }
        [HttpPost]
        public async Task<ActionResult<News>> PostNews(News news)
        {
            // Tự động gán thời gian tạo, không nhận từ client
            news.CreatedAt = DateTime.UtcNow;

            _context.News.Add(news);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNewsById), new { id = news.Id }, news);
        }

        // 4. CẬP NHẬT TIN TỨC
        // PUT: api/News/5
        // Body JSON: { "id": 5, "title": "...", "content": "...", "author": "..." }
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNews(int id, News news)
        {
            if (id != news.Id)
            {
                return BadRequest(new { message = "ID truyền vào và ID của object không khớp." });
            }

            _context.Entry(news).State = EntityState.Modified;
            // Không cho phép client ghi đè CreatedAt
            _context.Entry(news).Property(n => n.CreatedAt).IsModified = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NewsExists(id))
                {
                    return NotFound(new { message = "Không tìm thấy bài tin để cập nhật." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // 5. XÓA TIN TỨC
        // DELETE: api/News/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNews(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null)
            {
                return NotFound(new { message = "Không tìm thấy bài tin để xóa." });
            }

            _context.News.Remove(news);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Hàm phụ trợ kiểm tra tin tức có tồn tại không
        private bool NewsExists(int id)
        {
            return _context.News.Any(e => e.Id == id);
        }
    }
}
