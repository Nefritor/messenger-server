import {getUserByUUID} from './users.js';
import {sendEachClient} from '../src/utils.js';

const messages = [];

const getMessageList = () => {
    return messages.map((message) => _fillUserData(message));
}

const _addMessage = (message) => {
    messages.push(message);
}

const broadcastMessage = (wss, message) => {
    _addMessage(message);
    sendEachClient(wss, 'message', [_fillUserData(message)]);
}

const _fillUserData = (message) => {
    const user = getUserByUUID(message.uuid);
    return {
        ...message,
        username: user?.username || '[Пользователь удалён]',
        type: user?.type || 0
    }
}

export {
    getMessageList,
    broadcastMessage
}