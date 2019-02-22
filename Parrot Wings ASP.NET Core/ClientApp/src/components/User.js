import React, { Component } from 'react';
import Transaction from './Transaction';
import TransactionHistory from './TransactionHistory';
import { withRouter } from 'react-router-dom';
import './User.css'

class User extends Component {

    displayName = User.name;

    constructor(props) {
        super(props);
        //берем из хранилища данные пользователя
        this.state = {
            userId:localStorage.getItem('LoggedUserId'),
            userName:localStorage.getItem('LoggedUserName'),
            userBalance: localStorage.getItem('LoggedUserBalance'),
            userPassword: localStorage.getItem('LoggedUserPassword'),
            transaction: false,
            transactionData: null
        };

        //указываем контекст
        //this.onSubmit = this.onSubmit.bind(this);
        this.NewTransaction = this.NewTransaction.bind(this);
        this.TransactionHistory = this.TransactionHistory.bind(this);
        this.UpdateBalance = this.UpdateBalance.bind(this); 
        this.UpdateStateTransaction = this.UpdateStateTransaction.bind(this);
        this.LogOut = this.LogOut.bind(this);
    }

    //статус - активная транзакция, ререндер с компонентом транзакции
    NewTransaction() {
        this.setState({ transaction : true });
    }

    //статус - неактивная транзакция (рендерятся компоненты истории)
    TransactionHistory() {
        this.setState({ transaction: false });
    }

    //этот метод пробросим в компоненты транзакций для запуска 
    //ре-рендеринга родительского компонента при изменении баланса
    UpdateBalance(newBalance) {
        this.setState({ userBalance: newBalance });
    }

    //этот метод пробросим в компоненты транзакции и истории для запуска 
    //ре-рендеринга родительского компонента при изменении флага транзакции
    //(состояние при завершении или отмене транзакции)
    UpdateStateTransaction(newState, newTransactionData) {
        if (typeof newTransactionData === "undefined") {
            this.setState({ transaction: newState, transactionData: null });
        }
        else {
            this.setState({ transaction: newState, transactionData: newTransactionData});
        }
    }

    //Выход из учетной записи
    LogOut() {
        //чистим все и уходим
        localStorage.clear();
        this.props.history.push('/');
    }

    render() {
        //если в компоненте нет информации авторизованного пользователя
        //перебрасываем на компонент авторизации
        if (this.state.userId === null || this.state.userId === "") {
            this.props.history.push('/');
        }

        //если нет флага транзакции - рендерим компоненты показа истории и кнопку новой транзакции
        //пробрасываем в компоненты необходимые параметры
        if (this.state.transaction===false) {
            return (
                <div className="widthFull">
                    <div className="header">
                        <img src="images/parrot.png" className="parrot" alt="wing" />                                                    
                        <div className="userInfo">
                            <h3>User accaunt: {this.state.userName}</h3>
                            <div>User PW balance: {this.state.userBalance}</div>
                        </div>                                                
                        <div className="buttons">
                            <input type="button" value="New transaction" onClick={this.NewTransaction} />
                            <input type="button" value="Log out" onClick={this.LogOut} />
                        </div>                     
                        <img src="images/parrot.png" className="parrot flip" alt="wing" />
                    </div>
                    <TransactionHistory userId={this.state.userId} UpdateStateTransaction={this.UpdateStateTransaction}/>
                </div>
            );
        }
        //если флаг транзакции присутствует - компонент транзакции и кнопку перехода к истории
        //пробрасываем в компоненты необходимые параметры
        else {
            return (
                <div className="widthFull">
                    <div className="header">
                        <img src="images/parrot.png" className="parrot" alt="wing" />
                        <div className="userInfo">
                            <h3>User accaunt: {this.state.userName}</h3>
                            <div>User PW balance: {this.state.userBalance}</div>
                        </div>   
                        <div className="buttons">
                            <input type="button" value="View History" onClick={this.TransactionHistory} />
                            <input type="button" value="Log out" onClick={this.LogOut} />
                        </div>
                        <img src="images/parrot.png" className="parrot flip" alt="wing" />
                    </div>
                    <div className="container widthFull">
                        <Transaction userId={this.state.userId} userPassword={this.state.userPassword} transactionData={this.state.transactionData} UpdateBalance={this.UpdateBalance} UpdateStateTransaction={this.UpdateStateTransaction} />
                    </div>  
                </div>
            );
        }
       
    }
}
        
        
export default withRouter(User);