using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Achivement : BaseEntity
    {
        public string Label { get; set; }
        public int Rarity { get; set; }
    }
}
