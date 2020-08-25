using System.Collections.Generic;

namespace Whale.DAL.Settings
{
    public class BlobStorageSettings
    {
        public string ConnectionString { get; set; }
        public string ImageContainerName { get; set; }
        public string VideoContainerName { get; set; }
        public string AudioContainerName { get; set; }
        public IList<string> AllowedOrigins { get; set; }
    }
}
