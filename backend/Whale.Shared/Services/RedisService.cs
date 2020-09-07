using Newtonsoft.Json;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

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
            var configString = $"{_redisHost}";
            _redis = ConnectionMultiplexer.Connect(configString);
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
            return value.IsNullOrEmpty ? default : JsonConvert.DeserializeObject<T>(value);
        }

        public async Task AddToSetAsync<T>(string setKey, T value)
        {
            var db = _redis.GetDatabase();
            await db.SetAddAsync(setKey, JsonConvert.SerializeObject(value));
        }

        public async Task<IEnumerable<T>> GetSetMembersAsync<T>(string setKey)
        {
            var db = _redis.GetDatabase();
            RedisValue[] values = await db.SetMembersAsync(setKey);
            var stringValues = values.ToStringArray();
            var json = $"[{String.Join(",", stringValues)}]";
            return JsonConvert.DeserializeObject<IEnumerable<T>>(json);
        }

        public async Task DeleteSetMemberAsync<T>(string setKey, T setMember)
        {
            var db = _redis.GetDatabase();
            await db.SetRemoveAsync(setKey, JsonConvert.SerializeObject(setMember));
        }

        public async Task DeleteKeyAsync(string key)
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
            return value.IsNullOrEmpty ? default : JsonConvert.DeserializeObject<T>(value);
        }

        public async Task RemoveAsync(string key)
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(key);
        }

        public async Task AddToListAsync<T>(string setKey, T value)
        {
            var db = _redis.GetDatabase();
            await db.ListRightPushAsync(setKey, JsonConvert.SerializeObject(value));
        }

        public async Task<string> GetAllListJsonAsync(string setKey)
        {
            var db = _redis.GetDatabase();
            RedisValue[] values = await db.ListRangeAsync(setKey, 0, -1);
            var stringValues = values.ToStringArray();
            return $"[{String.Join(",", stringValues)}]";
        }
    }
}
