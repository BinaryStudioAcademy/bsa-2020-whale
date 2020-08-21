using System.Net.Mail;

namespace Whale.API.Services
{
    public class SlackService
    {
        public bool IsValidEmail(string email)
        {
            try
            {
                var address = new MailAddress(email);
                return address.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}
