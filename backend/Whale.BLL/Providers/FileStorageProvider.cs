using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Extensions.Configuration;
using MimeTypes;
using System;
using System.Threading.Tasks;

namespace Whale.BLL.Providers
{
    public class FileStorageProvider
    {
        private CloudBlobClient _blobClient;

        public FileStorageProvider(IConfiguration configuration)
        {
            string connectionString = configuration.GetConnectionString("AzureBlobStorage");

            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connectionString);
            _blobClient = storageAccount.CreateCloudBlobClient();
        }

        public async Task<string> UploadFileAsync(IFormFile file)
        {
            string contentType = file.ContentType.Split('/')[0];

            var container = _blobClient.GetContainerReference(contentType);
            await setPublicContainerPermissionsAsync(container);

            string fileName = contentType + '_' + Guid.NewGuid().ToString() + MimeTypeMap.GetExtension(file.ContentType);

            CloudBlockBlob blockBlob = container.GetBlockBlobReference(fileName);
            blockBlob.Properties.ContentType = file.ContentType;

            using var stream = file.OpenReadStream();
            await blockBlob.UploadFromStreamAsync(stream);
            stream.Close();

            return blockBlob.Uri.AbsoluteUri;
        }

        private async Task setPublicContainerPermissionsAsync(CloudBlobContainer container)
        {
            await container.CreateIfNotExistsAsync();
            BlobContainerPermissions permissions = new BlobContainerPermissions
            {
                PublicAccess = BlobContainerPublicAccessType.Blob
            };
            await container.SetPermissionsAsync(permissions);
        }
    }
}
