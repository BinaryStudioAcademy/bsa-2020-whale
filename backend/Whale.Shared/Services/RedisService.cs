using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace Whale.Shared.Services
{
    public class RedisService
    {

        private readonly string _redisHost;
        private ConnectionMultiplexer _redis;

        public RedisService(string connectionString)
        {
            _redisHost = connectionString;
        }
        public async Task ConnectAsync()
        {
                var configString = $"{_redisHost}";
                _redis = await ConnectionMultiplexer.ConnectAsync(configString);
        }
        public void Connect()
        {
            try
            {
                var configString = $"{_redisHost}";
                _redis = ConnectionMultiplexer.Connect(configString);
            }
            catch (RedisConnectionException err)
            {
                //Log.Error(err.ToString());
                throw err;
            }
            //Log.Debug("Connected to Redis");
        }

        public void Set<T>(string key, T value)
        {
            var db = _redis.GetDatabase();
            db.StringSet(key, JsonConvert.SerializeObject(value));
        }
        public T Get<T>(string key)
        {
            var db = _redis.GetDatabase();
            var value = db.StringGet(key);
            return value == value.IsNull ? default : JsonConvert.DeserializeObject<T>(value);
        }

        public async Task AddToSet<T>(string setKey, T value)
        {
            var db = _redis.GetDatabase();
            await db.SetAddAsync(setKey, JsonConvert.SerializeObject(value));
        }

        public async Task<ICollection<T>> GetSetMembers<T>(string setKey)
        {
            var db = _redis.GetDatabase();
            RedisValue[] values = await db.SetMembersAsync(setKey);
            var stringValues = values.ToStringArray();
            var json = $"[{String.Join(",", stringValues)}]";
            return JsonConvert.DeserializeObject<ICollection<T>>(json);
        }

        public async Task DeleteSetMember<T>(string setKey, T setMember)
        {
            var db = _redis.GetDatabase();
            await db.SetRemoveAsync(setKey, JsonConvert.SerializeObject(setMember));
        }

        public async Task DeleteKey(string key)
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(key);
        }

        public async Task SetAsync<T>(string key, T value)
        {
            var db = _redis.GetDatabase();
            await db.StringSetAsync(key, JsonConvert.SerializeObject(value));

        }
        public async Task<T> GetAsync<T>(string key)
        {
            var db = _redis.GetDatabase();
            var value = await db.StringGetAsync(key);
            return value == value.IsNull ? default : JsonConvert.DeserializeObject<T>(value);
        }

        public async Task RemoveAsync(string key)
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(key);
        }
    }
}