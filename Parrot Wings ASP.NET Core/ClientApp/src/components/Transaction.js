import React, { Component } from 'react';
import { API_DOMAIN } from '../AppSettings';
import './Transaction.css'

export default class Transaction extends Component {

    displayName = Transaction.name;

    constructor(props) {
        super(props);
        //берем из хранилища данные пользователя
        this.state = {
            recipients: null
        };

        //указываем контекст       
        this.SubmitTransaction = this.SubmitTransaction.bind(this); 
        this.CancelTransaction = this.CancelTransaction.bind(this); 
        this.HideLayout = this.HideLayout.bind(this);
        this.CustomValidation = this.CustomValidation.bind(this);
        this.ClearValidationFail = this.ClearValidationFail.bind(this);
    }

    //запуск транзакции
    SubmitTransaction(event) {
        event.preventDefault();

        //сохраняем указатель на компонент
        let componentContext = this;
        //пройдя HTML валидацию останавливаем базовое поведение
        event.preventDefault();

        //для безопасного использования API (чтобы не утекал баланс от сфабрикованных запросов) предусматриваю подтверждение запроса паролем пользователя
        //данные не должны быть открытыми - POST
        let xhr = new XMLHttpRequest();
        //готовим данные формы к отправке
        //получаем "правильный" JSON
        let data = new FormData(document.getElementById("transactionForm"));
        //добавляем необходимую информацию к объекту 
        data.append("password", this.props.userPassword);
        data.append("addresserId", this.props.userId);
        let recipientText = document.querySelector(".recipients").value;
        //парсим регулярным выражением id получателя (?<=#)\d*$
        let recipientId = (recipientText.match(/(?<=#)\d*$/ig))[0];
        data.append("recipientId", recipientId);
        //создаем пустой объект для дальнейшей сериализации
        let object = {};
        //формируем пары ключ-значение из формы и пишем в объект
        data.forEach(function (value, key) {
            object[key] = value;
        });
        //формируем из объекта корректный JSON
        let dataJson = JSON.stringify(object);

        //формируем запрос к контроллеру с учетом домена API
        let url = API_DOMAIN + "api/User/Transaction";
        xhr.open('POST', url, true);
        //флаг кросс-доменного запроса
        xhr.withCredentials = true;
        //уточняем тип данных кросс-доменного запроса
        xhr.setRequestHeader('Content-Type', 'application/json');
        //событие успешного завершения запроса
        xhr.onload = function () {
            //парсинг JSON ответа в объекты
            let responce = JSON.parse(xhr.responseText);
            //если присутствует проблемный статус
            if ("state" in responce) {
                //сервисное сообщение
                if (responce.state === 'transactionDataError') {
                    let loadingLayout = document.querySelector(".messageLayout");
                    loadingLayout.innerHTML = "<div><span>An error occurred during the server request</span><input type='button' class='hideLayout' value='Ok'></div>";
                }
                //недостаточный баланс
                if (responce.state === 'InsufficientAccountBalance') {
                    //скрываем ненужное и показываем необходимое
                    let loadingLayout = document.querySelector(".messageLayout");
                    let transactionForm = document.querySelector("#transactionForm");
                    transactionForm.classList.remove("hidden");
                    loadingLayout.classList.add("hidden");
                    //заменяем контент сервисного дива на контен ожидания
                    loadingLayout.innerHTML = '<img src="images/loadIndicator.gif" alt="Processing" /><span> Processing...</span >';
                    let amountTextbox = document.querySelector(".amount");
                    amountTextbox.setCustomValidity("Not enough PW to remit the transaction");
                    transactionForm.reportValidity();
                }
            }
            //иначе получаем доступ к идентификатору и пишем его в локальное хранилище
            else {
                if ("balance" in responce) {
                    //обновляем отображение счета
                    componentContext.props.UpdateBalance(responce.balance);
                    //уходим с компонента транзакции
                    componentContext.props.UpdateStateTransaction(false);
                }
                else {
                    //сервисное сообщение
                    let loadingLayout = document.querySelector(".messageLayout");
                    loadingLayout.innerHTML = "<div><span>An error occurred during the server request.</span><input type='button' class='hideLayout' value='Ok'></div>";
                }
            }
        };
        //событие ошибки запроса
        xhr.onerror = function () {
            let loadingLayout = document.querySelector(".messageLayout");
            loadingLayout.innerHTML = "<div><span>An error occurred during the server request.</span><input type='button' class='hideLayout' value='Ok'></div>";
        }
        //при старте запроса убираем форму и показываем див ожидания
        xhr.onloadstart = function () {
            let loadingLayout = document.querySelector(".messageLayout");
            let transactionForm = document.querySelector("#transactionForm");
            transactionForm.classList.add("hidden");
            loadingLayout.classList.remove("hidden");
        }

        //запускаем передачу данных
        xhr.send(dataJson);
    }

    //делигированная обработка нажатия кнопки сокрытия подложки с информацией
    HideLayout(event) {
        //проверяем всплывший элемент
        if (!event.target.classList.contains('hideLayout')) {
            return;
        }
        //скрываем ненужное и показываем необходимое
        let loadingLayout = document.querySelector(".messageLayout");
        let transactionForm = document.querySelector("#transactionForm");
        transactionForm.classList.remove("hidden");
        loadingLayout.classList.add("hidden");
        //заменяем контент сервисного дива на контен ожидания
        loadingLayout.innerHTML = '<img src="images / loadIndicator.gif" alt="Processing" />< span > Processing...</span >';
    }

    //отмена выполнения транзакции
    CancelTransaction() {
        this.props.UpdateStateTransaction(false);
    }

    //получаем список пользователей для транзакции
    componentDidMount() {

        //сохраняем указатель на компонент
        let componentContext = this;

        let xhr = new XMLHttpRequest();
        //формируем запрос к контроллеру с учетом домена API
        let url = API_DOMAIN + "api/User/GetRecipient/" + componentContext.props.userId;
        xhr.open('GET', url, true);
        //флаг кросс-доменного запроса
        xhr.withCredentials = true;
        //уточняем тип данных кросс-доменного запроса
        xhr.setRequestHeader('Content-Type', 'application/json');
        //событие успешного завершения запроса
        xhr.onload = function () {
            //парсинг JSON ответа в объекты
            let responce = JSON.parse(xhr.responseText);
            //если присутствует проблемный статус
            if ("state" in responce) {
                //сервисное сообщение
                if (responce.state === 'transactionDataError') {
                    let loadingLayout = document.querySelector(".messageLayout");
                    loadingLayout.innerHTML = "<div><span>An error occurred during the server request</span><input type='button' class='hideLayout' value='Ok'></div>";
                }
                if (responce.state === 'wrongData') {
                    //сервисное сообщение
                    let loadingLayout = document.querySelector(".messageLayout");
                    loadingLayout.innerHTML = "<div><span>There is no user with the specified data</span><input type='button' class='hideLayout' value='Ok'></div>";
                }                
            }
            //иначе заносим в состояние полученные данные
            else {
                if ("recipients" in responce) {
                    componentContext.setState({ recipients: responce.recipients});

                    let loadingLayout = document.querySelector(".messageLayout");
                    let transactionForm = document.querySelector("#transactionForm");
                    transactionForm.classList.remove("hidden");
                    loadingLayout.classList.add("hidden");
                    //заменяем контент сервисного дива на контен ожидания
                    loadingLayout.innerHTML = '<img src="images/loadIndicator.gif" alt="Processing" /><span> Processing...</span >';
                }
                else {
                    //сервисное сообщение
                    let loadingLayout = document.querySelector(".messageLayout");
                    loadingLayout.innerHTML = "<div><span>An error occurred during the server request</span><input type='button' class='hideLayout' value='Ok'></div>";
                }
            }
        };
        //событие ошибки запроса
        xhr.onerror = function () {
            let loadingLayout = document.querySelector(".messageLayout");
            loadingLayout.innerHTML = "<div><span>An error occurred during the server request</span><input type='button' class='hideLayout' value='Ok'></div>";
        }
        //при старте запроса убираем форму и показываем див ожидания
        xhr.onloadstart = function () {
            let loadingLayout = document.querySelector(".messageLayout");
            let transactionForm = document.querySelector("#transactionForm");
            transactionForm.classList.add("hidden");
            loadingLayout.classList.remove("hidden");
        }
        //запускаем передачу данных
        xhr.send();
    }

    //пользовательская валидация данных
    CustomValidation() {
        //проверяемый список
        let recipientsListbox = document.querySelector(".recipients");
        //смотрим есть ли введенное значение в списке данных
        let isInList = this.state.recipients.find(function (item) {
            return (item.name + " - id#" + item.id) === recipientsListbox.value;
        });

        //если его нет
        if (!isInList) {
            recipientsListbox.setCustomValidity("User data specified is not a list item");
        }
        else {
            recipientsListbox.setCustomValidity("");
        }
        //присутствует серверная валидация состояния баланса пользователя
        //(на сервере самая актуальная информация, вдруг кто-то
        //во время заполнения формы пополнил баланс пользователя).
        //обнуляем состояние ошибки перед отправкой на сервер
        let amountTextbox = document.querySelector(".amount");
        amountTextbox.setCustomValidity("");
    }

    //сброс ошибки валидации при вводе новых данных
    ClearValidationFail(event) {
        let recipientsListbox = document.querySelector(".recipients");
        recipientsListbox.setCustomValidity("");
        let amountTextbox = document.querySelector(".amount");
        amountTextbox.setCustomValidity("");
    }

    render() {
        //обработка полученных от сервера данных
        let optionRecipientsList;
        if (this.state.recipients != null) {
            optionRecipientsList = this.state.recipients.map((user) =>
                <option key={user.id} value={user.name + " - id#" + user.id} />
            );
        }
        else{
            optionRecipientsList = "";
        }

        //если без данных для повтора транзакции
        if (this.props.transactionData == null) {
            return (
                <div className="transactionForm container">
                    <h3>Transaction</h3>
                    <form id="transactionForm" onSubmit={this.SubmitTransaction}>
                        <input list="recipients" className="recipients" required placeholder="Choose recipient" autoComplete="off" onChange={this.ClearValidationFail} />
                        <datalist id="recipients">
                            {optionRecipientsList}
                        </datalist>
                        <input type="number" min="1" className="amount" name="amount" placeholder="PW transaction amount" autoComplete="off" onChange={this.ClearValidationFail} title="Numeric" />
                        <input type="submit" value="Submit" onClick={this.CustomValidation} />
                        <input type="button" value="Cancel" onClick={this.CancelTransaction} />
                    </form>
                    <div className="messageLayout hidden" onClick={this.HideLayout}>
                        <img src="images/loadIndicator.gif" alt="Processing"/>
                        <span>Processing...</span>
                    </div>
                </div>
            );
        }
        //если данные для повтора транзакции есть
        else {
            //десериализуем в объект
            let transactionData = JSON.parse(this.props.transactionData);
            //подставляем данные в поля
            let recipient = transactionData.userName + " - id#" + transactionData.userId;
            let amount = transactionData.amount;
            return (
                <div className="transactionForm container">
                    <h3>Transaction</h3>
                    <form id="transactionForm" onSubmit={this.SubmitTransaction}>
                        <input list="recipients" className="recipients" required defaultValue={recipient} placeholder="Choose recipient" autoComplete="off" onChange={this.ClearValidationFail} />
                        <datalist id="recipients">
                            {optionRecipientsList}
                        </datalist>
                        <input type="number" min="1" className="amount" name="amount" placeholder="PW transaction amount" defaultValue={transactionData.amount} autoComplete="off" onChange={this.ClearValidationFail} required title="Numeric" />
                        <input type="submit" value="Submit" onClick={this.CustomValidation} />
                        <input type="button" value="Cancel" onClick={this.CancelTransaction} />
                    </form>
                    <div className="messageLayout hidden" onClick={this.HideLayout}>
                        <img src="images/loadIndicator.gif" alt="Processing"/>
                        <span>Processing...</span>
                    </div>
                </div>
            );
        }
    }
}
