import dotenv from 'dotenv';
import express from 'express';
import WSExpress from 'express-ws';
import {v4 as createUUID} from 'uuid';
import {createHash} from 'crypto';
import cors from 'cors';

dotenv.config();
const app = express();
const wss = WSExpress(app).getWss();
app.use(express.json());
app.use(cors());

const sessions = [];
const users = [];
const messages = [];

const login = (data, ws, req) => {
    console.log(`Login event: ${data}`);

    ws.send('login successful');
}
const updateMessagesList = (message) => {
    messages.push(message);
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({type: 'message', data: [message]}));
    })
}

const hashText = (text) => {
    return createHash('md5').update(text).digest('hex');
}

const register = (username, password) => {
    const uuid = createUUID();
    users.push({
        uuid,
        username: username,
        password: hashText(password)
    })
    return createSession(uuid);
}

const createSession = (uuid) => {
    const sid = createUUID();
    sessions.push({
        sid,
        uuid
    });
    return sid;
}

const updateSession = (uuid) => {
    const existSession = getSession(uuid);
    if (existSession) {
        return existSession.sid;
    }
    return createSession(uuid);
}

const getSession = (uuid) => {
    return sessions.find((session) => session.uuid === uuid);
}

const checkPassword = (password, userData) => {
    return hashText(password) === userData.password;
}

const getUserDataFromName = (username) => {
    return users.find((user) => user.username.toLowerCase() === username.toLowerCase());
}

const getUserDataFromUUID = (uuid) => {
    return users.find((user) => user.uuid === uuid);
}

const getUserDataFromSID = (sid) => {
    const session = sessions.find((session) => session.sid === sid);
    if (session?.uuid) {
        return getUserDataFromUUID(session.uuid);
    }
    return false;
}

app.ws('/', (ws, req) => {
    console.log('new websocket connection');
    ws.send(JSON.stringify({type: 'connection', messages}));
    ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        console.log(data);
        switch (data.type) {
            case 'message':
                if (data.data.text) {
                    return updateMessagesList(data.data, ws, req);
                }
        }
    })
})

app.get('/get-users', (req, res) => {
    res.end(JSON.stringify(users));
})

app.get('/get-messages', (req, res) => {
    res.end(JSON.stringify(messages));
})

app.post('/signup', (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.sendStatus(400);
    }
    if (!getUserDataFromName(username)) {
        res.end(JSON.stringify({type: 'success', message: 'Успешно зарегестрирован', sid: register(username, password)}));
    } else {
        res.end(JSON.stringify({type: 'error', message: 'Пользователь уже зарегестрирован'}));
    }
})

app.post('/signin', (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.sendStatus(400);
    }
    const userData = getUserDataFromName(username);
    if (userData && checkPassword(password, userData)) {
        res.end(JSON.stringify({type: 'success', sid: updateSession(userData.uuid)}));
    } else {
        res.end(JSON.stringify({type: 'error', message: 'Введены неверные данные'}));
    }
})

app.post('/get-session', (req, res) => {
    const sid = req.body.sid;
    if (!sid) {
        return res.sendStatus(400);
    }
    const userData = getUserDataFromSID(sid);
    if (userData) {
        res.end(JSON.stringify({type: 'success', userData}));
    } else {
        res.end(JSON.stringify({type: 'error', message: 'Не найдено активной сессии'}));
    }
})

app.post('/get-userdata', (req, res) => {
    const uuid = req.body.uuid;
    if (!uuid) {
        return res.sendStatus(400);
    }
    const userData = getUserDataFromUUID(uuid);
    if (userData) {
        res.end(JSON.stringify({type: 'success', userData: userData}));
    } else {
        res.end(JSON.stringify({type: 'error', message: 'Пользователь не найден'}));
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));