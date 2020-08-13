using Microsoft.Extensions.Configuration;

namespace Whale.API.Extensions
{
    public static class ConfigurationExtensions
    {
        public static T Bind<T>(this IConfiguration configuration, string key)
            where T : class, new()
        {
            T objectToBind = new T();
            configuration.Bind(key, objectToBind);
            return objectToBind;
        }
    }
}
