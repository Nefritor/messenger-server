import express from 'express';
import WSExpress from 'express-ws';
import cors from 'cors';

const initExpress = () => {
    const app = express();
    app.use(express.json());
    app.use(cors());
    const wss = WSExpress(app).getWss();
    return [app, wss];
}

const setAppRoutes = (app, routes) => {
    routes.forEach((route) => {
        switch (route.type) {
            case 'get':
                app.get(route.url, _processRequest(route.callback));
                break;
            case 'post':
                app.post(route.url, _processRequest(route.callback));
                break;
        }
    })
}

const openWS = (app, {url, onOpen, onMessage, onClose}) => {
    app.ws(url, (ws, req) => {
        onOpen(ws, req);
        ws.on('message', (msg) => {
            onMessage(ws, JSON.parse(msg));
        });
        ws.on('close', (code) => {
            onClose(ws, code);
        })
    })
}

const _processRequest = (callback) => {
    return (req, res) => {
        res.header("Content-Type", "application/json; charset=utf-8")
        callback({
            data: req.body,
            send: (data) => {
                return res.end(JSON.stringify(data), 'utf-8');
            },
            sendStatus: (statusCode) => {
                return res.sendStatus(statusCode);
            }
        })
    }
}

export {
    initExpress,
    setAppRoutes,
    openWS
}