import {v4 as createUUID} from 'uuid';

import {getTime, hashText, sendEachClient} from '../src/utils.js';

const users = [];

const initOnlineCheck = (wss, timeout = 60) => {
    console.log('online check event');
    _checkOnline(wss);
    setTimeout(() => {
        initOnlineCheck(wss, timeout);
    }, timeout * 1000);
}

const _checkOnline = (wss) => {
    const online = [];
    wss.clients.forEach((client) => {
        online.push(client.uuid);
    });
    let listChanged = false;
    users.forEach((user) => {
        const isOnline = online.includes(user.uuid);
        if (isOnline && !user.online) {
            setOnline(user);
            listChanged = true;
        } else if (!isOnline && user.online) {
            setOffline(user);
            listChanged = true;
        }
    })
    if (listChanged) {
        broadcastOnline(wss);
    }
}

const addUser = (user) => {
    users.push(user);
    return user.uuid;
}

const createUser = ({username, password, type}) => {
    return {
        uuid: createUUID(),
        username,
        password: hashText(password),
        type: getUserType(type)
    }
}

const setOnline = (user) => {
    user.online = true;
    user.lastOnline = getTime();
}

const setOffline = (user) => {
    user.online = false;
}

const getUserType = (type) => {
    switch (type) {
        case '0':
        case '1':
            return type;
        default:
            return '0';
    }
}

const register = ({username, password, type}) => {
    try {
        const uuid = addUser(createUser({username, password, type}));
        return {type: 'success', message: 'Успешно зарегистрирован', uuid};
    } catch (err) {
        return {type: 'error', message: err.message};
    }
}

const getUsers = () => {
    return users.map((user) => getUserData(user));
}

const getUserByName = (username) => {
    return users.find((user) => user.username === username);
}

const getUserByUUID = (uuid) => {
    return users.find((user) => user.uuid === uuid);
}

const getUserData = (user) => {
    return {
        uuid: user.uuid,
        username: user.username,
        type: user.type,
        online: user.online,
        lastOnline: user.lastOnline
    }
}

const broadcastOnline = (wss) => {
    sendEachClient(wss, 'online', getUsers());
}

const hasUser = (uuid) => {
    return users.some((user) => user.uuid === uuid);
}

const hasUserByName = (username) => {
    return users.some((user) => user.username === username);
}

export {
    addUser,
    createUser,
    register,
    getUsers,
    broadcastOnline,
    getUserData,
    getUserByName,
    getUserByUUID,
    hasUser,
    hasUserByName,
    initOnlineCheck,
    setOnline,
    setOffline
}