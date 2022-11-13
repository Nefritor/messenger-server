import {createHash} from 'crypto';

const getTime = () => {
    return new Date().getTime();
}

const closeClients = (wss, uuid, code, message) => {
    let hasConnection = false;
    wss.clients.forEach((ws) => {
        if (ws.uuid === uuid) {
            hasConnection = true;
            ws.close(code, message);
        }
    });
    return hasConnection;
}

const sendEachClient = (wss, type, data) => {
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({type, data}));
    })
}

const hashText = (text) => {
    return createHash('md5').update(text).digest('hex');
}

export {
    getTime,
    closeClients,
    hashText,
    sendEachClient
}