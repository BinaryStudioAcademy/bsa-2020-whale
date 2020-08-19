using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Whale.DAL.Models;
using Whale.DAL.Settings;

namespace Whale.Shared.Extentions
{
    public static class UserExtentions
    {
        public static async Task<User> LoadAvatarAsync(this User user, BlobStorageSettings settings)
        {
            if(user.LinkType == LinkTypeEnum.External) return user;

            var response = await getAllBlobsAsync(settings);

            return getLinkFromStorage(user, response);
        }

        public static IEnumerable<T> LoadAvatars<T>(this IEnumerable<T> source, BlobStorageSettings settings, Func<T, User> predicate)
        {
            var response = getAllBlobs(settings);

            return source.Select(t =>
            {
                predicate(t).getLinkFromStorage(response);
                return t;
            });
        }

        public static IQueryable<User> LoadAvatars(this IQueryable<User> source, BlobStorageSettings settings)
        {
            var response = getAllBlobs(settings);

            return source.Select(u => u.getLinkFromStorage(response));
        }

        private static async Task<BlobResultSegment> getAllBlobsAsync(BlobStorageSettings settings)
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(settings.ConnectionString);
            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference(settings.ImageContainerName);
            return await container.ListBlobsSegmentedAsync(null);
        }

        private static BlobResultSegment getAllBlobs(BlobStorageSettings settings)
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(settings.ConnectionString);
            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference(settings.ImageContainerName);
            return container.ListBlobsSegmented(null);
        }

        private static User getLinkFromStorage(this User user, BlobResultSegment response)
        {
            if (user.LinkType == LinkTypeEnum.External) return user;

            var blob = response.Results.FirstOrDefault(x => x.Uri.Segments.Contains(user.AvatarUrl));
            if (blob != null)
            {
                user.AvatarUrl = blob.Uri.AbsoluteUri;
            }
            return user;
        }
    }
}
