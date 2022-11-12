import {v4 as createUUID} from 'uuid';

import {hashText} from '../src/utils.js';

const users = [];

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
    return users;
}

const getUserByName = (username) => {
    return users.find((user) => user.username === username);
}

const getUserByUUID = (uuid) => {
    return users.find((user) => user.uuid === uuid);
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
    getUserByName,
    getUserByUUID,
    hasUser,
    hasUserByName
}