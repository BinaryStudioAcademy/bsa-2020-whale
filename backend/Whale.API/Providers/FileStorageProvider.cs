﻿using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using MimeTypes;
using System;
using System.Threading.Tasks;
using Whale.API.Models;
using Whale.DAL.Settings;

namespace Whale.API.Providers
{
    public class FileStorageProvider
    {
        private readonly CloudBlobClient _blobClient;
        private readonly BlobStorageSettings _settings;

        public FileStorageProvider(BlobStorageSettings settings)
        {
            _settings = settings;

            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(_settings.ConnectionString);
            _blobClient = storageAccount.CreateCloudBlobClient();
        }

        public async Task<string> UploadFileAsync(IFormFile file, FileTypeEnum type)
        {
            string contentType = file.ContentType.Split('/')[0];

            CloudBlobContainer container = null;
            switch (type)
            {
                case FileTypeEnum.Audio:
                    container = _blobClient.GetContainerReference(_settings.AudioContainerName);
                    break;
                case FileTypeEnum.Image:
                    container = _blobClient.GetContainerReference(_settings.ImageContainerName);
                    break;
                case FileTypeEnum.Video:
                    container = _blobClient.GetContainerReference(_settings.VideoContainerName);
                    break;
                case FileTypeEnum.Attachment:
                    container = _blobClient.GetContainerReference(_settings.AttachmentContainerName);
                    break;
            }
            await SetPublicContainerPermissionsAsync(container);

            string fileName;
            try
            {
                fileName = contentType + '_' + Guid.NewGuid().ToString() + MimeTypeMap.GetExtension(file.ContentType);
            }
            catch
            {
                fileName = contentType + '_' + Guid.NewGuid().ToString();
            }

            CloudBlockBlob blockBlob = container.GetBlockBlobReference(fileName);
            blockBlob.Properties.ContentType = file.ContentType;

            using var stream = file.OpenReadStream();
            await blockBlob.UploadFromStreamAsync(stream);
            stream.Close();

            return blockBlob.Uri.AbsoluteUri;
        }

        public async Task<string> UploadAudioFileAsync(IFormFile file)
        {
            string contentType = file.ContentType.Split('/')[0];

            var container = _blobClient.GetContainerReference(_settings.AudioContainerName);
            await SetPublicContainerPermissionsAsync(container);

            string fileName;
            try
            {
                fileName = contentType + '_' + Guid.NewGuid().ToString() + MimeTypeMap.GetExtension(file.ContentType);
            }
            catch
            {
                fileName = contentType + '_' + Guid.NewGuid().ToString();
            }

            CloudBlockBlob blockBlob = container.GetBlockBlobReference(fileName);
            blockBlob.Properties.ContentType = "audio/mpeg";

            using var stream = file.OpenReadStream();
            await blockBlob.UploadFromStreamAsync(stream);
            stream.Close();

            return blockBlob.Uri.AbsoluteUri;
        }

        private async Task SetPublicContainerPermissionsAsync(CloudBlobContainer container)
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
