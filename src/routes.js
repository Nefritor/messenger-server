import {getMessageList} from '../models/messages.js';
import {getUserByName, getUserByUUID, getUsers, hasUserByName, register} from '../models/users.js';
import {hashText} from './utils.js';

const routes = [{
    type: 'get',
    url: '/get-users',
    callback: ({send}) => {
        send(getUsers());
    }
}, {
    type: 'get',
    url: '/get-messages',
    callback: ({send}) => {
        send(getMessageList());
    }
}, {
    type: 'post',
    url: '/signup',
    callback: ({data, send, sendStatus}) => {
        const {username, password, type} = data;
        if (!username || !password) {
            return sendStatus(400);
        }
        if (!hasUserByName(username)) {
            send(register({username, password, type}));
        } else {
            send({type: 'error', message: 'Пользователь уже зарегестрирован'});
        }
    }
}, {
    type: 'post',
    url: '/signin',
    callback: ({data, send, sendStatus}) => {
        const {username, password} = data;
        if (!username || !password) {
            return sendStatus(400);
        }
        const user = getUserByName(username);
        if (user && user.password === hashText(password)) {
            send({type: 'success', message: 'Успешно выполнен вход', uuid: user.uuid});
        } else {
            send({type: 'error', message: 'Введены неверные данные'});
        }
    }
}, {
    type: 'post',
    url: '/get-userdata',
    callback: ({data, send, sendStatus}) => {
        const {uuid} = data;
        if (!uuid) {
            return sendStatus(400);
        }
        const user = getUserByUUID(uuid);
        if (user) {
            send({type: 'success', userData: user});
        } else {
            send({type: 'error', message: 'Пользователь не найден'});
        }
    }
}]

const getRoutes = () => {
    return routes;
}

export {
    getRoutes
}