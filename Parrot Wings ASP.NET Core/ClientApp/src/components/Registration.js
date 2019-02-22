import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { API_DOMAIN } from '../AppSettings';
import './Registration.css'

class Registration extends Component {

    displayName = Registration.name;

    constructor(props) {
        super(props);
        this.state = {};

        //указываем контекст
        this.onSubmit = this.onSubmit.bind(this);
        this.GoToLogin = this.GoToLogin.bind(this);
        this.HideLayout = this.HideLayout.bind(this);
        this.CustomValidation = this.CustomValidation.bind(this);
        this.OnChange = this.OnChange.bind(this);
    }

    //запуск регистрации
    onSubmit(event) {
        //сохраняем указатель на компонент
        let componentContext = this;
        //пройдя HTML валидацию останавливаем базовое поведение
        event.preventDefault();
        
        //для большей безопасности учетных данных данные будут
        //передаваться методом POST(как минимум в логах светиться не будут)
        //учитывая, что предполагается использование HTTPS, этого должно быть достаточно
        //создаем объект для осуществления фонового асинхронного запроса к серверу
        let xhr = new XMLHttpRequest();
        //готовим данные формы к отправке
        //получаем "правильный" JSON
        let data = new FormData(document.getElementById("registrationForm"));
        //создаем пустой объект для дальнейшей сериализации
        let object = {};
        //формируем пары ключ-значение из формы и пишем в объект
        data.forEach(function (value, key) {
            object[key] = value;
        });
        //формируем из объекта корректный JSON
        let dataJson = JSON.stringify(object);
        //формируем запрос к контроллеру с учетом домена API
        let url = API_DOMAIN + "api/User/Registration";
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
                //если почта уже присутствует в базе
                if (responce.state === 'notUiqueEmail') {
                    //скрываем ненужное и показываем необходимое
                    let loadingLayout = document.querySelector(".messageLayout");
                    let registrationForm = document.querySelector("#registrationForm");
                    registrationForm.classList.remove("hidden");
                    loadingLayout.classList.add("hidden");
                    //заменяем контент сервисного дива на контен ожидания
                    loadingLayout.innerHTML = '<img src="images/loadIndicator.gif" /><span> Processing...</span>';
                    let emailTextbox = document.querySelector(".email");
                    emailTextbox.setCustomValidity("This e-mail is already registered");    
                    registrationForm.reportValidity();
                }
            }
            //иначе получаем доступ к идентификатору и пишем его в локальное хранилище
            else {
                if ("user" in responce) {
                    //сохраняем ключ пользователя в локальное хранилище (хранимые данные разрослись - оформи в хранимый объект если время будет)
                    localStorage.setItem('LoggedUserId', responce.user.id);
                    localStorage.setItem('LoggedUserName', responce.user.name);
                    localStorage.setItem('LoggedUserBalance', responce.user.balance);
                    localStorage.setItem('LoggedUserPassword', responce.user.password);
                    //осуществляем редирект на компонент страницы пользователя
                    componentContext.props.history.push('/user');
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
            let registrationForm = document.querySelector("#registrationForm");
            registrationForm.classList.add("hidden");
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
        let registrationForm = document.querySelector("#registrationForm");
        registrationForm.classList.remove("hidden");
        loadingLayout.classList.add("hidden");
        //заменяем контент сервисного дива на контен ожидания
        loadingLayout.innerHTML = '<img src="images/loadIndicator.gif" /><span> Processing...</span>';
    }

    //переход к компоненту авторизации
    GoToLogin() {
        this.props.history.push('/');
    }

    //пользовательская валидация формы
    CustomValidation() {
        //проверяемые поля с паролем
        let passwordTextbox = document.querySelector(".password");
        let repeatPasswordTextbox = document.querySelector(".repeatPassword");
        if (passwordTextbox.value !== repeatPasswordTextbox.value)
        {
            repeatPasswordTextbox.setCustomValidity("Passwords do not match");
        }
        else {
            repeatPasswordTextbox.setCustomValidity("");
        }
        //присутствует серверная валидация корректности почты
        //обнуляем состояние ошибки перед отправкой на сервер
        let emailTextbox = document.querySelector(".email");
        emailTextbox.setCustomValidity("");
    }

    //при вводе новых данных необходимо сбрасывать состояние ошибки повтора пароля
    OnChange() {
        let repeatPasswordTextbox = document.querySelector(".repeatPassword");
        repeatPasswordTextbox.setCustomValidity("");
    }

    render() {
        return (
            <div className="registrationForm container">
                <h3>Registration</h3>
                <form id="registrationForm" onSubmit={this.onSubmit}>
                    <input type="text" name="userName" placeholder="User name" autoComplete="off" required />
                    <input type="text" className="email" name="email" placeholder="User e-mail" autoComplete="off" required pattern="^.+@.+\..+$" title="E-mail format: any@any.any"/>
                    <input type="password" className="password" name="password" placeholder="Password" required />
                    <input type="password" className="repeatPassword" placeholder="Repeat password" onChange={this.OnChange} required />
                    <input type="submit" value="Submit" onClick={this.CustomValidation} />
                    <input type="button" value="Back" onClick={this.GoToLogin} />
                </form>
                <div className="messageLayout hidden" onClick={this.HideLayout}>
                    <img src="images/loadIndicator.gif" alt="Processing" />
                    <span>Processing...</span>
                </div>
            </div>
        );
    }
}


export default withRouter(Registration);