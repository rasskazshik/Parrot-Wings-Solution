using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Parrot_Wings_ASP.NET_Framework_API.Models
{
    public class HistoryItemDataModel
    {
        public int userId { get; set; }
        public string userName { get; set; }
        public string date { get; set; }
        public int amount { get; set; }
        public int balance { get; set; }
        public bool isCredit { get; set; }
    }
}