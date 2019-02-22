import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { API_DOMAIN } from '../AppSettings';
import './Login.css'

class Login extends Component {

    displayName = Login.name;

    constructor(props) {
        super(props);
        this.state = {};

        //указываем контекст
        this.onSubmit = this.onSubmit.bind(this);
        this.HideLayout = this.HideLayout.bind(this);
        this.GoToRegistration = this.GoToRegistration.bind(this);
    }

    //авторизация
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
        let data = new FormData(document.getElementById("loginform")); 
        //создаем пустой объект для дальнейшей сериализации
        let object = {};
        //формируем пары ключ-значение из формы и пишем в объект
        data.forEach(function (value, key) {
            object[key] = value;
        });
        //формируем из объекта корректный JSON
        let dataJson = JSON.stringify(object);
        //формируем запрос к контроллеру с учетом домена API
        let url = API_DOMAIN + "api/User/Login";
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
                if (responce.state === 'wrongData') {
                    //сервисное сообщение
                    let loadingLayout = document.querySelector(".messageLayout");
                    loadingLayout.innerHTML = "<div><span>There is no user with the specified data</span><input type='button' class='hideLayout' value='Ok'></div>";
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
            let loginform = document.querySelector("#loginform");
            loginform.classList.add("hidden");
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
        let loginform = document.querySelector("#loginform");
        loginform.classList.remove("hidden");
        loadingLayout.classList.add("hidden");
        //заменяем контент сервисного дива на контен ожидания
        loadingLayout.innerHTML = '<img src="images/loadIndicator.gif"/><span> Processing...</span>';
    }

    //навигация на компонент регистрации
    GoToRegistration() {
        this.props.history.push('/registration');
    }

    render() {        
        return (
            <div className="loginform container">
                <h3>Authorization</h3>
                <form id="loginform" onSubmit={this.onSubmit}>
                    <input type="text" name="email" placeholder="User e-mail" autoComplete="off" required pattern="^.+@.+\..+$" title="E-mail format: any@any.any"/>
                    <input type="password" name="password" placeholder="Password" required />
                        <input type="submit" value="Login" />
                        <input type="button" value="Registration" onClick={this.GoToRegistration} />                    
                </form>
                <div className="messageLayout hidden" onClick={this.HideLayout}>
                    <img src="images/loadIndicator.gif" alt="Processing" />
                    <span>Processing...</span>
                </div>
            </div>
            );        
        }
}

export default withRouter(Login);