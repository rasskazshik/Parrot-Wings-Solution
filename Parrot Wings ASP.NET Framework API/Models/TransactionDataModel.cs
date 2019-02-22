using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Parrot_Wings_ASP.NET_Framework_API.Models
{
    public class TransactionDataModel
    {
            [Required]
            public string password { get; set; }

            [Required]
            public int addresserId { get; set; }

            [Required]
            public int recipientId { get; set; }

            [Required]
            public int amount { get; set; }
    }
}