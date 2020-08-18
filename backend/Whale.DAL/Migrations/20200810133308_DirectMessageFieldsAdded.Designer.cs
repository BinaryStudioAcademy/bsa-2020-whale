﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Whale.DAL;

namespace Whale.DAL.Migrations
{
    [DbContext(typeof(WhaleDbContext))]
    partial class WhaleDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.6")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Whale.DAL.Models.Achivement", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<string>("Label")
                    .HasColumnType("nvarchar(max)");

                b.Property<int>("Rarity")
                    .HasColumnType("int");

                b.HasKey("Id");

                b.ToTable("Achivements");
            });

            modelBuilder.Entity("Whale.DAL.Models.Contact", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("FirstMemberId")
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid?>("FirstMemberSettingsId")
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid?>("PinnedMessageId")
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("SecondMemberId")
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid?>("SecondMemberSettingsId")
                    .HasColumnType("uniqueidentifier");

                b.HasKey("Id");

                b.HasIndex("FirstMemberId");

                b.HasIndex("FirstMemberSettingsId");

                b.HasIndex("PinnedMessageId");

                b.HasIndex("SecondMemberId");

                b.HasIndex("SecondMemberSettingsId");

                b.ToTable("Contacts");
            });

            modelBuilder.Entity("Whale.DAL.Models.ContactSetting", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<bool>("IsBloked")
                    .HasColumnType("bit");

                b.Property<bool>("IsMuted")
                    .HasColumnType("bit");

                b.Property<Guid>("UserId")
                    .HasColumnType("uniqueidentifier");

                b.HasKey("Id");

                b.HasIndex("UserId");

                b.ToTable("ContactSettings");
            });

            modelBuilder.Entity("Whale.DAL.Models.DirectMessage", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<bool>("Attachment")
                    .HasColumnType("bit");

                b.Property<Guid>("AuthorId")
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("ContactId")
                    .HasColumnType("uniqueidentifier");

                b.Property<DateTimeOffset>("CreatedAt")
                    .HasColumnType("datetimeoffset");

                b.Property<string>("Message")
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                b.HasKey("Id");

                b.HasIndex("AuthorId");

                b.HasIndex("ContactId");

                b.ToTable("DirectMessages");
            });

            modelBuilder.Entity("Whale.DAL.Models.Group", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<string>("Description")
                    .HasColumnType("nvarchar(max)");

                b.Property<string>("Label")
                    .HasColumnType("nvarchar(max)");

                b.Property<Guid>("PinnedMessageId")
                    .HasColumnType("uniqueidentifier");

                b.HasKey("Id");

                b.HasIndex("PinnedMessageId");

                b.ToTable("Groups");
            });

            modelBuilder.Entity("Whale.DAL.Models.GroupMessage", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<bool>("Attachment")
                    .HasColumnType("bit");

                b.Property<Guid>("ContactId")
                    .HasColumnType("uniqueidentifier");

                b.Property<string>("Message")
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                b.HasKey("Id");

                b.HasIndex("ContactId");

                b.ToTable("GroupMessages");
            });

            modelBuilder.Entity("Whale.DAL.Models.GroupUser", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("GroupId")
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("UserId")
                    .HasColumnType("uniqueidentifier");

                b.HasKey("Id");

                b.HasIndex("GroupId");

                b.HasIndex("UserId");

                b.ToTable("GroupUsers");
            });

            modelBuilder.Entity("Whale.DAL.Models.Meeting", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<int>("AnonymousCount")
                    .HasColumnType("int");

                b.Property<bool>("IsRecurrent")
                    .HasColumnType("bit");

                b.Property<bool>("IsScheduled")
                    .HasColumnType("bit");

                b.Property<string>("Settings")
                    .HasColumnType("nvarchar(max)");

                b.Property<DateTimeOffset>("StartTime")
                    .HasColumnType("datetimeoffset");

                b.HasKey("Id");

                b.ToTable("Meetings");
            });

            modelBuilder.Entity("Whale.DAL.Models.Participant", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("MeetingId")
                    .HasColumnType("uniqueidentifier");

                b.Property<int>("Role")
                    .HasColumnType("int");

                b.Property<Guid>("UserId")
                    .HasColumnType("uniqueidentifier");

                b.HasKey("Id");

                b.HasIndex("MeetingId");

                b.HasIndex("UserId");

                b.ToTable("Participants");
            });

            modelBuilder.Entity("Whale.DAL.Models.Poll.OptionResult", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<string>("Option")
                    .HasColumnType("nvarchar(max)");

                b.Property<Guid>("PollResultId")
                    .HasColumnType("uniqueidentifier");

                b.Property<int>("VoteCount")
                    .HasColumnType("int");

                b.HasKey("Id");

                b.HasIndex("PollResultId");

                b.ToTable("OptionResults");
            });

            modelBuilder.Entity("Whale.DAL.Models.Poll.PollResult", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<bool>("IsAnonymous")
                    .HasColumnType("bit");

                b.Property<Guid>("MeetingId")
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("PollId")
                    .HasColumnType("uniqueidentifier");

                b.Property<string>("Title")
                    .HasColumnType("nvarchar(max)");

                b.Property<int>("TotalVoted")
                    .HasColumnType("int");

                b.Property<int>("VoteCount")
                    .HasColumnType("int");

                b.HasKey("Id");

                b.ToTable("PollResults");
            });

            modelBuilder.Entity("Whale.DAL.Models.Poll.Voter", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<string>("Email")
                    .HasColumnType("nvarchar(max)");

                b.Property<Guid>("OptionResultId")
                    .HasColumnType("uniqueidentifier");

                b.HasKey("Id");

                b.HasIndex("OptionResultId");

                b.ToTable("Voters");
            });

            modelBuilder.Entity("Whale.DAL.Models.Record", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("MeetingId")
                    .HasColumnType("uniqueidentifier");

                b.Property<string>("Source")
                    .HasColumnType("nvarchar(max)");

                b.Property<int>("Type")
                    .HasColumnType("int");

                b.HasKey("Id");

                b.HasIndex("MeetingId");

                b.ToTable("Records");
            });

            modelBuilder.Entity("Whale.DAL.Models.Setting", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("UserId")
                    .HasColumnType("uniqueidentifier");

                b.Property<string>("Values")
                    .HasColumnType("nvarchar(max)");

                b.HasKey("Id");

                b.HasIndex("UserId");

                b.ToTable("Settings");
            });

            modelBuilder.Entity("Whale.DAL.Models.User", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<string>("AvatarUrl")
                    .HasColumnType("nvarchar(max)");

                b.Property<string>("Email")
                    .HasColumnType("nvarchar(max)");

                b.Property<string>("FirstName")
                    .HasColumnType("nvarchar(max)");

                b.Property<int>("LinkType")
                    .HasColumnType("int");

                b.Property<string>("Phone")
                    .HasColumnType("nvarchar(max)");

                b.Property<DateTimeOffset>("RegistrationDate")
                    .HasColumnType("datetimeoffset");

                b.Property<string>("SecondName")
                    .HasColumnType("nvarchar(max)");

                b.HasKey("Id");

                b.ToTable("Users");
            });

            modelBuilder.Entity("Whale.DAL.Models.UserAchivement", b =>
            {
                b.Property<Guid>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("uniqueidentifier");

                b.Property<Guid>("AchivementId")
                    .HasColumnType("uniqueidentifier");

                b.Property<int>("Progress")
                    .HasColumnType("int");

                b.Property<Guid>("UserId")
                    .HasColumnType("uniqueidentifier");

                b.HasKey("Id");

                b.HasIndex("AchivementId");

                b.HasIndex("UserId");

                b.ToTable("UserAchivements");
            });

            modelBuilder.Entity("Whale.DAL.Models.Contact", b =>
            {
                b.HasOne("Whale.DAL.Models.User", "FirstMember")
                    .WithMany()
                    .HasForeignKey("FirstMemberId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.HasOne("Whale.DAL.Models.ContactSetting", "FirstMemberSettings")
                    .WithMany()
                    .HasForeignKey("FirstMemberSettingsId");

                b.HasOne("Whale.DAL.Models.DirectMessage", "PinnedMessage")
                    .WithMany()
                    .HasForeignKey("PinnedMessageId");

                b.HasOne("Whale.DAL.Models.User", "SecondMember")
                    .WithMany()
                    .HasForeignKey("SecondMemberId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.HasOne("Whale.DAL.Models.ContactSetting", "SecondMemberSettings")
                    .WithMany()
                    .HasForeignKey("SecondMemberSettingsId");
            });

            modelBuilder.Entity("Whale.DAL.Models.ContactSetting", b =>
            {
                b.HasOne("Whale.DAL.Models.User", "User")
                    .WithMany()
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.DirectMessage", b =>
            {
                b.HasOne("Whale.DAL.Models.User", "Author")
                    .WithMany()
                    .HasForeignKey("AuthorId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.HasOne("Whale.DAL.Models.Contact", "Contact")
                    .WithMany()
                    .HasForeignKey("ContactId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.Group", b =>
            {
                b.HasOne("Whale.DAL.Models.GroupMessage", "PinnedMessage")
                    .WithMany()
                    .HasForeignKey("PinnedMessageId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.GroupMessage", b =>
            {
                b.HasOne("Whale.DAL.Models.Contact", "Contact")
                    .WithMany()
                    .HasForeignKey("ContactId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.GroupUser", b =>
            {
                b.HasOne("Whale.DAL.Models.Group", "Group")
                    .WithMany()
                    .HasForeignKey("GroupId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.HasOne("Whale.DAL.Models.User", "User")
                    .WithMany()
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.Participant", b =>
            {
                b.HasOne("Whale.DAL.Models.Meeting", "Meeting")
                    .WithMany()
                    .HasForeignKey("MeetingId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.HasOne("Whale.DAL.Models.User", "User")
                    .WithMany()
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.Poll.OptionResult", b =>
            {
                b.HasOne("Whale.DAL.Models.Poll.PollResult", null)
                    .WithMany("OptionResults")
                    .HasForeignKey("PollResultId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.Poll.Voter", b =>
            {
                b.HasOne("Whale.DAL.Models.Poll.OptionResult", null)
                    .WithMany("VotedUsers")
                    .HasForeignKey("OptionResultId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.Record", b =>
            {
                b.HasOne("Whale.DAL.Models.Meeting", "Meeting")
                    .WithMany()
                    .HasForeignKey("MeetingId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.Setting", b =>
            {
                b.HasOne("Whale.DAL.Models.User", "User")
                    .WithMany()
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });

            modelBuilder.Entity("Whale.DAL.Models.UserAchivement", b =>
            {
                b.HasOne("Whale.DAL.Models.Achivement", "Achivement")
                    .WithMany()
                    .HasForeignKey("AchivementId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.HasOne("Whale.DAL.Models.User", "User")
                    .WithMany()
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();
            });
#pragma warning restore 612, 618
        }
    }
}