using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Parrot_Wings_ASP.NET_Framework_API.Models
{
    public class HistoryDataModel
    {
        [Required]
        public int userId { get; set; }
        
        public string date { get; set; }
        public int amount { get; set; }
        public string name { get; set; }
    }
}