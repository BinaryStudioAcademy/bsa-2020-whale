using AutoMapper;
using Whale.DAL.Models.Question;
using Whale.Shared.Models.Question;

namespace Whale.MeetingAPI.MappingProfiles
{
    public class QuestionProfile : Profile
	{
		public QuestionProfile()
		{
			CreateMap<QuestionCreateDTO, Question>();
			CreateMap<QuestionDTO, Question>().ReverseMap();
			CreateMap<UserDataDTO, UserData>().ReverseMap();
		}
	}
}
