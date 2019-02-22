import React, { Component } from 'react';
import { API_DOMAIN } from '../AppSettings';
import './TransactionHistory.css'

export default class TransactionHistory extends Component {

    displayName = TransactionHistory.name;

    constructor(props) {
        super(props);
        //берем из хранилища данные пользователя
        this.state = {
            history:null
        };

        //указываем контекст
        this.LoadHistory = this.LoadHistory.bind(this);
        this.Search = this.Search.bind(this);
        this.RepeatTransaction = this.RepeatTransaction.bind(this);
    }

    //получаем историю транзакций для отображения
    componentDidMount() {
        //ищем историю
        this.LoadHistory(this.props.userId);        
    }

    //поиск истории с параметрами
    LoadHistory(userId, name, date, amount) {

        //сохраняем указатель на компонент
        let componentContext = this;

        let xhr = new XMLHttpRequest();
        //формируем запрос к контроллеру с учетом домена API
        let url = API_DOMAIN + "api/User/GetHistory/";
        //формируем параметры поиска
        let data = new FormData();        
        if (typeof userId === "undefined") {
            //это обязательный параметр
            return;
        }
        if (typeof date === "undefined") {
            date = "";
        }
        if (typeof amount === "undefined") {
            amount = 0;
        }
        if (typeof name === "undefined") {
            name = "";
        }
        data.append('userId', userId);
        data.append('date', date);
        data.append('amount', amount);
        data.append('name', name);
        //создаем пустой объект для дальнейшей сериализации
        let object = {};
        //формируем пары ключ-значение из формы и пишем в объект
        data.forEach(function (value, key) {
            object[key] = value;
        });
        //формируем из объекта корректный JSON
        let dataJson = JSON.stringify(object);

        xhr.open('POST', url, true);
        //флаг кросс-доменного запроса
        xhr.withCredentials = true;
        //уточняем тип данных кросс-доменного запроса
        xhr.setRequestHeader('Content-Type', 'application/json');
        //событие успешного завершения запроса
        xhr.onload = function () {
            //парсинг JSON ответа в объекты
            let responce = JSON.parse(xhr.responseText);
            if ("state" in responce) {
                if (responce.state === "noItems") {
                    componentContext.setState({ history: "none" });
                }
            }
            if ("history" in responce) {
                componentContext.setState({ history: responce.history });
            }
        };
        //запускаем передачу данных
        xhr.send(dataJson);
    }

    //фильтрация истории
    Search() {
        //запускаем валидацию формы с фильтрами
        //если не проходит проверку - останов метода поиска
        if (!document.querySelector(".filters").reportValidity()) {
            return;
        }
        //берем параметры поиска
        let dateInput = document.querySelector(".dateSearch").value;
        let userNameInput = document.querySelector(".userNameSearch").value;
        let amountInput = document.querySelector(".amountSearch").value;
        let date;
        if (dateInput !== "") {            
            date = dateInput;
        }
        let userName;
        if (userNameInput !== "") {           
            userName = userNameInput;
        }
        let amount;
        if (amountInput !== "") {            
            amount = amountInput;
        }
        //ищем историю
        //если параметры не инициализированны - идут как undefiened, будто бы и не указаны
        this.LoadHistory(this.props.userId, userName, date, amount);
    }

    //делигированная обработка нажатия кнопки повтора транзакции
    RepeatTransaction(event) {
        //проверяем всплывший элемент
        if (!event.target.classList.contains('repeatTransaction')) {
            return;
        }
        this.props.UpdateStateTransaction(true, event.target.getAttribute("transactiondata"));
    }

    render() {
        //если нет доступной истории транзакций - рендерим компонент "лоадером"
        if (this.state.history === null || this.state.history === "undefined") {
            return (
                <div className="widthFull">
                    <h3 className="historyTitle">Transaction history</h3>
                    <div className="filtersContainer">
                        <form className="filters">
                            <input type="date" className="dateSearch" name="dateFilter" />
                            <input type="text" className="userNameSearch" name="userFilter" placeholder="User name" />
                            <input type="number" className="amountSearch" min="1" name="amountFilter" placeholder="Amount PW" />
                        </form>
                        <input className="buttonSearch" type="button" value="Search" onClick={this.Search} />
                    </div>
                    <div className="historyContainer">
                        <div className="processing">
                            <div className="messageLayout">
                                <img src="images/loadIndicator.gif" alt="Processing"/>
                                <span>Processing...</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        //если история загружена - отображаем
        else {
            let historyContent;
            //если не найдено
            if (this.state.history === "none") {
                historyContent = (<div className="historyItem noItems">
                                    <p className="value">History is empty</p>
                                </div>);
            }
            //если транзакции были найдены
            else {
                historyContent = this.state.history.map(function (item, key) {
                    //если это кредитная транзакция
                    if (item.isCredit === true) {
                        //формируем в строку jSon с данными для повтора транзакции
                        let object = {};
                        object["userId"] = item.userId;
                        object["userName"] = item.userName
                        object["amount"] = item.amount;                      
                        let jSonDataToRepeat = JSON.stringify(object);
                        //для упрощения доступа к данным при повторе транзакции, полученный объект (строку) внедряем атрибутом кнопки
                        return <div className="historyItem credit" key={key}>
                            <p className="date">{item.date}</p>
                            <p className="title">You transferred PW to:</p>
                            <p className="value">{item.userName}</p>
                            <p className="title">PW amount transfered:</p>
                            <p className="value">{item.amount} PW</p>
                            <p className="title">Balance after transfer:</p>
                            <p className="value">{item.balance} PW</p>
                            <input type="button" transactiondata={jSonDataToRepeat} className="repeatTransaction" value="Repeat transaction" />
                        </div>
                    }
                    else {
                        return <div className="historyItem debit" key={key}>
                            <p className="date">{item.date}</p>
                            <p className="title">The user who transferred PW:</p>
                            <p className="value">{item.userName}</p>
                            <p className="title">PW amount transfered:</p>
                            <p className="value">{item.amount} PW</p>
                            <p className="title">Balance after transfer:</p>
                            <p className="value">{item.balance} PW</p>
                        </div>
                    }  
                });
            }
            return (
                <div className="widthFull">
                    <h3 className="historyTitle">Transaction history</h3>
                    <div className="filtersContainer">
                        <form className="filters">
                            <input type="date" className="dateSearch" name="dateFilter" />
                            <input type="text" className="userNameSearch" name="userFilter" placeholder="User name" />
                            <input type="number" className="amountSearch" min="1" name="amountFilter" placeholder="Amount PW" />
                        </form>
                        <input className="buttonSearch" type="button" value="Search" onClick={this.Search} />
                    </div>
                    <div className="historyContainer" onClick={this.RepeatTransaction}>
                        {historyContent}                       
                    </div>
                </div>
            );
        }
    }
}
