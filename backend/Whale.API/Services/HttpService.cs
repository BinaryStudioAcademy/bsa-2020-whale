using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Whale.API.Services
{
    public class HttpService
    {
        private HttpClient _httpClient;
        private readonly string _baseUrl;

        public HttpService(HttpClient httpClient, string baseUrl)
        {
            _baseUrl = baseUrl;
            _httpClient = httpClient;
        }

        public async Task<T> GetAsync<T>(string requestUrl)
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/{requestUrl}");
            if(response.StatusCode != HttpStatusCode.OK)
                throw new Exception($"{response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
            return await response.Content.ReadAsAsync<T>();
        }

        public async Task<string> GetStringAsync(string requestUrl)
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/{requestUrl}");
            if (response.StatusCode != HttpStatusCode.OK)
                throw new Exception($"{response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
            return await response.Content.ReadAsStringAsync();
        }

        public async Task<T2> PostAsync<T1, T2>(string requestUrl, T1 body)
        {
            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/{requestUrl}", body);
            if (response.StatusCode != HttpStatusCode.OK && response.StatusCode != HttpStatusCode.Created)
                throw new Exception($"{response.StatusCode}: {await response.Content.ReadAsStringAsync()}");

            return await response.Content.ReadAsAsync<T2>();
        }

        public async Task PostAsync<T>(string requestUrl, T body)
        {
            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/{requestUrl}", body);
            if (response.StatusCode != HttpStatusCode.OK && response.StatusCode != HttpStatusCode.Created)
                throw new Exception($"{response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
        }

        public async Task<string> PostStringAsync<T>(string requestUrl, T body)
        {
            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/{requestUrl}", body);
            if (response.StatusCode != HttpStatusCode.OK && response.StatusCode != HttpStatusCode.Created)
                throw new Exception($"{response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
            return await response.Content.ReadAsStringAsync();
        }

        public async Task PutAsync<T1>(string requestUrl, T1 body)
        {
            var response = await _httpClient.PutAsJsonAsync($"{_baseUrl}/{requestUrl}", body);
            if (response.StatusCode != HttpStatusCode.OK)
                throw new Exception($"{response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
        }

        public async Task<T2> PutAsync<T1, T2>(string requestUrl, T1 body)
        {
            var response = await _httpClient.PutAsJsonAsync($"{_baseUrl}/{requestUrl}", body);
            if (response.StatusCode != HttpStatusCode.OK)
                throw new Exception($"{response.StatusCode}: {await response.Content.ReadAsStringAsync()}");

            return await response.Content.ReadAsAsync<T2>();
        }

        public async Task DeleteAsync(string requestUrl)
        {
            var response = await _httpClient.DeleteAsync($"{_baseUrl}/{requestUrl}");
            if (response.StatusCode != HttpStatusCode.NoContent)
                throw new Exception($"{response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
        }
    }
}
