using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Parrot_Wings_ASP.NET_Framework_API.Models
{
    public class LoginDataModel
    {
        [Required]
        public string email { get; set; }

        [Required]
        public string password { get; set; }
    }
}