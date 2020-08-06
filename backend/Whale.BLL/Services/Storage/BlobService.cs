using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Extensions.Configuration;
using MimeTypes;
using System;
using System.IO;
using System.Net.Mime;
using System.Threading.Tasks;

namespace Whale.BLL.Services.Storage
{
    public class BlobService
    {
        private CloudBlobContainer _container;

        public BlobService(IConfiguration configuration)
        {
            string connectionString = configuration.GetConnectionString("AzureBlobStorage");

            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connectionString);
            CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
            _container = blobClient.GetContainerReference("images");
        }

        public async Task<string> SaveImage(IFormFile file)
        {
            await _container.CreateIfNotExistsAsync();

            string fileName = "img_" + Guid.NewGuid().ToString() + MimeTypeMap.GetExtension(file.ContentType);


            CloudBlockBlob blockBlob = _container.GetBlockBlobReference(fileName);
            blockBlob.Properties.ContentType = file.ContentType;
            using var stream = file.OpenReadStream();

            await blockBlob.UploadFromStreamAsync(stream);
            stream.Close();

            return blockBlob.Uri.AbsoluteUri;
        }

        public async Task<string> GetImage(string fileName)
        {
            CloudBlockBlob blob = _container.GetBlockBlobReference(fileName);
            byte[] byteArray = new byte[blob.StreamMinimumReadSizeInBytes];
            await blob.DownloadToByteArrayAsync(byteArray, 0);

            string base64array = Convert.ToBase64String(byteArray, 0, byteArray.Length);

            return base64array;
        }
    }
}
