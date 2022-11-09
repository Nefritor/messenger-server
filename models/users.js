import {v4 as createUUID} from 'uuid';

import {hashText} from '../src/utils.js';

const users = [];

const addUser = ({uuid, username, password}) => {
    users.push({uuid, username, password});
    return uuid;
}

const createUser = ({username, password}) => {
    return {
        uuid: createUUID(),
        username,
        password: hashText(password)
    }
}

const register = ({username, password}) => {
    try {
        const uuid = addUser(createUser({username, password}));
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

export {
    addUser,
    createUser,
    register,
    getUsers,
    getUserByName,
    getUserByUUID,
    hasUser
}