using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace Parrot_Wings_ASP.NET_Framework_API.Models
{
    /// <summary>
    /// Класс-прослойка для доступа к данным при помощи EF
    /// Увы ленивая загрузка выключена для упрощения сериализации в JSON
    /// </summary>
    public class ParrotWingsEFDataAccessLayer
    {
        //берем актуальный контекст данных из модели данных EF
        ParrotWingsEntities dataContext = new ParrotWingsEntities();

        /// <summary>
        /// Проверка наличия учетных данных в БД
        /// </summary>
        /// <param name="email">Логин</param>
        /// <param name="password">Пароль</param>
        /// <returns>Ключ пользователя</returns>
        public User IsUser(string email, string password)
        {
            User findedUser = dataContext.User.ToList().Find( p => (p.email.ToLower()==email.ToLower() && p.password==password));
            return findedUser;
        }

        /// <summary>
        /// Получение всего списка пользователей
        /// </summary>
        /// <returns>Список классов модели пользователя</returns>
        public List<User> GetAllUsers()
        {
            try
            {
                return dataContext.User.ToList();
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Получение списка пользователей - получателей транзакции
        /// </summary>
        /// <returns>Список классов модели пользователя</returns>
        public List<User> GetRecipient(int id)
        {
            try
            {
                return dataContext.User.ToList().Where(p => p.id != id).ToList<User>();
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Получение информации пользователя согласно первичному ключу
        /// </summary>
        /// <param name="id">Первичный ключ</param>
        /// <returns>Класс модели пользователя или null</returns>
        public User GetUserById(int id)
        {
            try
            {
                return dataContext.User.ToList().Find(p => p.id == id);
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// проверяем наличие электроной почты в базе данных без учета регистра символов
        /// </summary>
        /// <param name="email">Электронная почта пользователя</param>
        /// <returns>Модель пользователя</returns>
        public bool IsEmailInDataBase(string email)
        {
            try
            {
                User user = dataContext.User.ToList().Find(p => p.email.ToLower() == email.ToLower());
                if(user==null)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Добавление нового пользователя
        /// </summary>
        /// <param name="userName">Имя пользователя</param>
        /// <param name="email">Электронная почта пользователя</param>
        /// <param name="password">Пароль пользователя</param>
        /// <returns>Модель добавленного пользователя</returns>
        public User AddNewUser(string userName, string email, string password)
        {
            try
            {
                //инициализируем модель пользователя
                var newUser = new User()
                {
                    name = userName,
                    email = email,
                    password = password,
                    balance = 500
                };
                // Добавление данных в локальный контекст таблицы User.
                dataContext.User.Add(newUser);
                // передаем изменения в базу
                dataContext.SaveChanges();
                Models.User findedUser = dataContext.User.ToList().Find(p => (p.email.ToLower() == email.ToLower()));
                return findedUser;                
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Смещение баланса пользователя прибавление
        /// </summary>
        /// <param name="userId"> ключ пользователя </param>
        /// <param name="amountPW"> количество PW </param>
        /// <returns></returns>
        public int HowMuchPWAdd(int userId, int amountPW)
        {
            try
            {
                var user = dataContext.User.ToList().Find(p => p.id == userId);
                return user.balance + amountPW;
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Смещение баланса пользователя вычет
        /// </summary>
        /// <param name="userId"> ключ пользователя </param>
        /// <param name="amountPW"> количество PW </param>
        /// <returns></returns>
        public int HowMuchPWSub(int userId, int amountPW)
        {
            try
            {
                var user = dataContext.User.ToList().Find(p => p.id == userId);
                return user.balance - amountPW;
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Увеличение баланса пользователя
        /// </summary>
        /// <param name="userId"> ключ пользователя </param>
        /// <param name="amountPW"> количество PW </param>
        /// <returns></returns>
        public void AddPW(int userId, int amountPW)
        {
            try
            {
                var user = dataContext.User.ToList().Find(p => p.id == userId);
                user.balance += amountPW;
                // передаем изменения в базу
                dataContext.SaveChanges();
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Уменьшение баланса пользователя
        /// </summary>
        /// <param name="userId"> ключ пользователя </param>
        /// <param name="amountPW"> количество PW </param>
        /// <returns></returns>
        public void SubPW(int userId, int amountPW)
        {
            try
            {
                var user = dataContext.User.ToList().Find(p => p.id == userId);
                user.balance -= amountPW;
                // передаем изменения в базу
                dataContext.SaveChanges();
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Проверка наличия средств для перевода
        /// </summary>
        /// <param name="userId"> ключ пользователя </param>
        /// <param name="amountPW"> количество PW </param>
        /// <returns></returns>
        public bool IsEnoughBalance(int userId, int amountPW)
        {
            try
            {
                var user = dataContext.User.ToList().Find(p => p.id == userId);
                if((user.balance - amountPW)<0)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Получение истории транзакций
        /// </summary>
        /// <param name="parameters">Параметры запроса поиска данных HistoryDataModel</param>
        /// <returns></returns>
        public List<HistoryItemDataModel> GetHistory(HistoryDataModel parameters)
        {
            List<HistoryItemDataModel> data = new List<HistoryItemDataModel>();
            //получаем все кредитные данные
            var credit = dataContext.Transaction.ToList().Where(p => p.idAddresser == parameters.userId).ToList();
            //получаем все дебитовые данные
            var debit = dataContext.Transaction.ToList().Where(p => p.idRecipient == parameters.userId).ToList();

            //формируем выходной список кредитных данных
            foreach (Transaction item in credit)
            {
                //ленивая загрузка... отключена...
                string userName = dataContext.User.ToList().Find(p => p.id == item.idRecipient).name;
                HistoryItemDataModel buff = new HistoryItemDataModel()
                {
                    userId = item.idRecipient,
                    userName = userName,
                    amount = item.amountPW,
                    balance = item.resultingAddresserBalance,
                    date = item.timestamp.ToString("G", CultureInfo.CreateSpecificCulture("de-DE")),
                    isCredit = true
                };
                data.Add(buff);
            }

            //формируем выходной список дебитовых данных
            foreach (Transaction item in debit)
            {
                //ленивая загрузка... отключена...
                string userName = dataContext.User.ToList().Find(p => p.id == item.idAddresser).name;
                HistoryItemDataModel buff = new HistoryItemDataModel()
                {
                    userId = item.idAddresser,
                    userName = userName,
                    amount = item.amountPW,
                    balance = item.resultingRecipientBalance,
                    date = item.timestamp.ToString("G", CultureInfo.CreateSpecificCulture("de-DE")),
                    isCredit = false
                };
                data.Add(buff);
            }

            //применяем фильтрации при необходимости
            if(parameters.date!="")
            {       
                //приводим к короткому формату даты с отсечением времени и сравниваем
                data = data.Where(p => DateTime.Parse(p.date).ToShortDateString() == DateTime.Parse(parameters.date).ToShortDateString()).ToList();
            }
            if (parameters.amount > 0)
            {
                data = data.Where(p => p.amount == parameters.amount).ToList();
            }
            if (parameters.name != "")
            {
                data = data.Where(p => p.userName == parameters.name).ToList();
            }
            //сортируем по дате
            data = data.OrderByDescending(p => p.date).ToList();
            //возвращаем данные
            return data;
        }

        /// <summary>
        /// Транзакция с подтверждениеп прав путем проверки соответствия пароля пользователя
        /// </summary>
        /// <param name="idRecipient">ключ получателя</param>
        /// <param name="idAddresser">ключ отправителя</param>
        /// <param name="amountPW">количество PW участвующих в транзакции</param>
        /// <param name="password">пароль пользователя совершающего трансфер средств</param>
        /// <returns>баланс после операции</returns>
        public int Transaction(int idRecipient, int idAddresser, int amountPW, string password)
        {
            try
            {
                var user = dataContext.User.ToList().Find(p => (p.id == idAddresser && p.password== password));
                if(user==null)
                {
                    throw new Exception("Operation access denied");
                }
                //инициализируем модель пользователя
                var transaction = new Transaction()
                {
                    idRecipient = idRecipient,
                    idAddresser = idAddresser,
                    amountPW = amountPW,
                    timestamp = DateTime.Now,
                    resultingAddresserBalance = HowMuchPWSub(idAddresser, amountPW),
                    resultingRecipientBalance = HowMuchPWAdd(idRecipient, amountPW)
                };
                // Добавление данных в локальный контекст таблицы
                dataContext.Transaction.Add(transaction);
                AddPW(idRecipient, amountPW);
                SubPW(idAddresser, amountPW);
                // передаем изменения в базу
                dataContext.SaveChanges();
                return transaction.resultingAddresserBalance;
            }
            catch
            {
                throw;
            }
        }
    }
}