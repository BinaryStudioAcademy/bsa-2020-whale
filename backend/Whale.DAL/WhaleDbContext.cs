using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using Whale.DAL.Models;
using Whale.DAL.Models.Messages;
using Whale.DAL.Models.Poll;

namespace Whale.DAL
{
    public class WhaleDbContext : DbContext
    {
        public WhaleDbContext(DbContextOptions<WhaleDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Achivement> Achivements { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<UnreadMessageId> UnreadMessageIds { get; set; }
        public DbSet<DirectMessage> DirectMessages { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMessage> GroupMessages { get; set; }
        public DbSet<GroupUser> GroupUsers { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<Participant> Participants { get; set; }
        public DbSet<Poll> PollResults { get; set; }
        public DbSet<Record> Records { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<UserAchivement> UserAchivements { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Contact>()
                .HasOne(a => a.PinnedMessage)
                .WithMany();

            modelBuilder.Entity<Group>()
                .HasOne(a => a.PinnedMessage)
                .WithMany();
           

            modelBuilder.Entity<Poll>()
                .Property(pollResult => pollResult.OptionResults)
                .HasConversion(
                    v => Newtonsoft.Json.JsonConvert.SerializeObject(v),
                    v => Newtonsoft.Json.JsonConvert.DeserializeObject<IEnumerable<OptionResult>>(v)
                );

            modelBuilder.Entity<Poll>()
                .Property(pollResult => pollResult.VotedUsers)
                .HasConversion(
                    v => Newtonsoft.Json.JsonConvert.SerializeObject(v),
                    v => Newtonsoft.Json.JsonConvert.DeserializeObject<IEnumerable<Voter>>(v)
                );

            //modelBuilder.Entity<UnreadMessageId>()
            //    .HasOne(um => um.DirectMessage)
            //    .WithMany()
            //    .HasForeignKey(da => da.MessageId);

            //modelBuilder.Entity<UnreadMessageId>()
            //   .HasOne(um => um.GroupMessage)
            //   .WithMany()
            //   .HasForeignKey(da => da.MessageId);

            //modelBuilder.Entity<UnreadMessageId>()
            //  .HasOne(um => um.Receiver)
            //  .WithMany()
            //  .HasForeignKey(da => da.ReceiverId);

            base.OnModelCreating(modelBuilder);
        }
    }
}