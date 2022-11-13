import dotenv from 'dotenv';

import {broadcastMessage, getMessageList} from './models/messages.js';
import {initExpress, openWS, setAppRoutes} from './server/server.js';

import {DISCONNECTED_BY_OTHER_CLIENT, USER_NOT_EXIST} from './src/codes.js';
import {getRoutes} from './src/routes.js';
import {closeClients} from './src/utils.js';
import {broadcastOnline, getUserByUUID, hasUser, initOnlineCheck, setOffline, setOnline} from './models/users.js';

dotenv.config();

const [app, wss] = initExpress();

setAppRoutes(app, getRoutes());

openWS(app, {
    url: '/:uuid',
    onOpen: (ws, req) => {
        const uuid = req.params.uuid;
        console.log(`user ${uuid} connected`);
        const user = getUserByUUID(uuid);
        if (user) {
            const hasConnection = closeClients(
                wss,
                uuid,
                DISCONNECTED_BY_OTHER_CLIENT,
                'Завершён другим пользователем'
            );
            ws.uuid = uuid;
            ws.send(JSON.stringify({type: 'connection', messages: getMessageList()}));
            if (!hasConnection) {
                setOnline(user);
                broadcastOnline(wss);
                /*broadcastMessage(wss, {
                    uuid: uuid,
                    date: getTime(),
                    event: 'connection'
                });*/
            }
        } else {
            ws.close(USER_NOT_EXIST, 'Пользователя не существует');
        }
    },
    onMessage: (ws, data) => {
        if (hasUser(ws.uuid)) {
            switch (data.type) {
                case 'message':
                    if (data.data.text) {
                        broadcastMessage(wss, data.data);
                    }
                    break;
            }
        } else {
            ws.close(USER_NOT_EXIST, 'Пользователя не существует');
        }
    },
    onClose: (ws, code) => {
        const user = getUserByUUID(ws.uuid);
        if (user) {
            if (code !== DISCONNECTED_BY_OTHER_CLIENT) {
                console.log(`user ${ws.uuid} disconnected`);
                /*broadcastMessage(wss, {
                    uuid: ws.uuid,
                    date: getTime(),
                    event: 'disconnection'
                });*/
                setOffline(user);
                broadcastOnline(wss);
            } else {
                console.log(`user ${ws.uuid} disconnected by other client`);
            }
        }
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`)
    initOnlineCheck(wss);
});
