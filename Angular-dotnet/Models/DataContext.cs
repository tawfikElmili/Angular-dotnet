using Angular_dotnet.Models;
using Microsoft.EntityFrameworkCore;

namespace Angular_dotnet.DataAcess
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options)    : base(options)
        {
        }
        public DbSet<ArticleMatrix>? ArticleMatrices { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }
    }
}
