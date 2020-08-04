using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using Whale.DAL.Models;

namespace Whale.DAL
{
    public class WhaleDbContext:DbContext
    {
        public WhaleDbContext(DbContextOptions<WhaleDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Achivement> Achivements { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<DirectMessage> DirectMessages { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMessage> GroupMessages { get; set; }
        public DbSet<GroupUser> GroupUsers { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<Participant> Participants { get; set; }
        public DbSet<Poll> Polls { get; set; }
        public DbSet<Record> Records { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<UserAchivement> UserAchivements { get; set; }
    }
}
