using MassTransit;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Models;
using System.Collections.Generic;

namespace StudentContractService.Data
{
    public class ContractDbContext : DbContext
    {
        public ContractDbContext(DbContextOptions<ContractDbContext> options) : base(options) { }

        public DbSet<Student> Students { get; set; }
        public DbSet<Contract> Contracts { get; set; }
    }
}