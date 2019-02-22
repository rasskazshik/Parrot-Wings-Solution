using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Script.Serialization;

namespace Parrot_Wings_ASP.NET_Framework_API.Controllers
{
    //разрешаем все на свете для кросс-доменного доступа к контроллеру из https://localhost:44341 (проект с React приложением)
    //для этого был добавлен System.Web.Cors через NuGet и включен в App_Start конфиге
    //кроме того в Web.config добавлен ответ заголовка <add name="Access-Control-Allow-Credentials" value="true" />

    //для корректной сериализации данных (избежания петель) была отключена 
    //ленивая (отложенная) загрузка связанных данных в модели EF
    [EnableCors(origins: "https://localhost:44341", headers: "*", methods: "*")]
    public class ApiController : System.Web.Http.ApiController
    {     

        //импользуем прослойку доступа к данным с использованием EF (репозиторий отделяюший реализацию доступа к данным)
        Models.ParrotWingsEFDataAccessLayer contextData = new Models.ParrotWingsEFDataAccessLayer();

        /// <summary>
        /// Получение всего списка пользователей
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/User/GetUsers")]
        public JObject GetUsers()
        {
            //Получаем коллекцию данных
            var users = contextData.GetAllUsers();
            //Создаем объект для корректной передачи JSON
            JObject json = new JObject();
            //Формируем коллекцию JSON данных users из List
            json["users"] = JToken.FromObject(users);
            return json;
        }

        /// <summary>
        /// Получение данных пользователя согласно первичному ключу
        /// </summary>
        /// <param name="id">Первичный ключ</param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/User/UserDetails/{id}")]
        public JObject UserDetails(int id)
        {
            var user = contextData.GetUserById(id);
            JObject json = new JObject();
            json["users"] = JToken.FromObject(user);
            return json;
        }
 
        /// <summary>
        /// Получение данных пользователей участвующих в транзакциях согласно первичному ключу базового пользователя
        /// </summary>
        /// <param name="id">Первичный ключ</param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/User/GetRecipient/{id}")]
        public JObject GetRecipient(int id)
        {
            var recipients = contextData.GetRecipient(id);
            JObject json = new JObject();
            json["recipients"] = JToken.FromObject(recipients);
            return json;
        }


        /// <summary>
        /// Метод для авторизации пользователя
        /// </summary>
        /// <param name="loginData">Модель данных для авторизации</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/User/Login")]        
        public JObject Login(Models.LoginDataModel loginData)
        {
            //если данные получены и загружены в модель корректно
            if (ModelState.IsValid && loginData != null)
            {
                JObject json = new JObject();
                Models.User user = contextData.IsUser(loginData.email, loginData.password);
                if (user != null)
                {                    
                    json["user"] = JToken.FromObject(user);
                    return json;
                }
                else
                {
                    json["state"] = "wrongData";
                    return json;
                }
            }
            //если ошибка получения данных
            else
            {                
                JObject json = new JObject();
                json["state"] = "transactionDataError";
                return json;
            }
        }

        /// <summary>
        /// Получение истории транзакций
        /// </summary>
        /// <param name="loginData"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/User/GetHistory")]
        public JObject GetHistory(Models.HistoryDataModel historyData)
        {
            //если данные получены и загружены в модель корректно
            if (ModelState.IsValid && historyData != null)
            {
                JObject json = new JObject();
                List<Models.HistoryItemDataModel> history = contextData.GetHistory(historyData);
                if(history.Count>0)
                json["history"] = JToken.FromObject(history);
                else
                json["state"] = "noItems";
                return json;
            }
            //если ошибка получения данных
            else
            {
                JObject json = new JObject();
                json["state"] = "transactionDataError";
                return json;
            }
        }

        /// <summary>
        /// Метод для регистрации пользователя
        /// </summary>
        /// <param name="RegistrationData">Модель данных для регистрации</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/User/Registration")]
        public JObject Registration(Models.RegistrationDataModel RegistrationData)
        {
            //если данные получены и загружены в модель корректно
            if (ModelState.IsValid && RegistrationData != null)
            {
                JObject json = new JObject();
                //проверяем присутствие электронной почты в базе данных
                if (contextData.IsEmailInDataBase(RegistrationData.email))
                {
                    //если присутствует - отправляем соответствующий статус
                    json["state"] = "notUiqueEmail";
                    return json;
                }
                Models.User user = contextData.AddNewUser(RegistrationData.userName, RegistrationData.email, RegistrationData.password);
                if (user!=null)
                {
                    json["user"] = JToken.FromObject(user);
                    return json;
                }
                else
                {
                    json["state"] = "transactionDataError";
                    return json;
                }
            }
            //если ошибка получения данных
            else
            {
                JObject json = new JObject();
                json["state"] = "transactionDataError";
                return json;
            }
        }


        /// <summary>
        /// Проведение транзакции
        /// </summary>
        /// <param name="TransactionData">Модель данных для транзакции</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/User/Transaction")]
        public JObject Transaction(Models.TransactionDataModel TransactionData)
        {
            //если данные получены и загружены в модель корректно
            if (ModelState.IsValid && TransactionData != null)
            {
                JObject json = new JObject();
                //проверяем достаточно ли стредств на счете пользователя
                if (!contextData.IsEnoughBalance(TransactionData.addresserId,TransactionData.amount))
                {
                    //если нет - сообщаем
                    json["state"] = "InsufficientAccountBalance";
                    return json;
                }
                int balance = contextData.Transaction(TransactionData.recipientId, TransactionData.addresserId, TransactionData.amount, TransactionData.password);
                json["balance"] = balance;
                return json;
            }
            //если ошибка получения данных
            else
            {
                JObject json = new JObject();
                json["state"] = "transactionDataError";
                return json;
            }
        }
        
    }
}