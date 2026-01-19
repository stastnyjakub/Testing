import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';

import env from '@/env';

import { validateMessage } from './websockets.model';

type WSS = WebSocket.Server<typeof WebSocket, typeof http.IncomingMessage>;
const serverToken = 'myslimsizetenhletokennemusibytsecureprotozekomunikaceprobihaporadnaserveru';
export let wsConnection: WebSocket | undefined = undefined;

export const configureWSS = (app: express.Express) => {
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server: server });
  server.on('listening', () => {
    wsConnection = connectToWSS();
  });
  return { server, wss };
};

export const connectToWSS = () => {
  const conn = new WebSocket(`ws://127.0.0.1:3004/connection`, {
    headers: {
      'x-auth-token': serverToken,
    },
  });
  conn.onopen = () => console.log('open');

  return conn;
};

export const invalidateTag = (tag: string) => {
  try {
    if (!wsConnection?.OPEN) return;
    wsConnection.send(
      JSON.stringify({
        event: 'invalidate',
        data: tag,
      }),
    );
  } catch (e) {
    console.log('Tag invalidation error: ', e);
  }
};

const handleInvalidateData = (wss: WSS, ws: WebSocket, tagToInvalidate: string) => {
  const response = {
    type: 'invalidate',
    tag: tagToInvalidate,
    error: null,
  };
  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  });
};

const messageTypeHandlers = {
  invalidate: handleInvalidateData,
};

const getToken = (header: string) => {
  const [_, token] = header?.split(', ');
  return token;
};

const authenticateClient = (ws: WebSocket, request: http.IncomingMessage, next: () => void) => {
  try {
    const token = request.headers['x-auth-token']
      ? (request.headers['x-auth-token'] as string)
      : getToken(request.headers['sec-websocket-protocol'] || '');
    if (token === serverToken) return next();
    jwt.verify(token, env().QL_JWT_PRIVATE_KEY);
    next();
  } catch (e: any) {
    const response = {
      message: 'unauthorized',
      error: e?.message,
    };
    ws.close(undefined, JSON.stringify(response));
  }
};

export const initializeWSS = (wss: WSS) => {
  wss.on('connection', (ws, request) => {
    authenticateClient(ws, request, () => {
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message as unknown as string);
          const { error, value } = validateMessage(data);
          if (error) return ws.send(JSON.stringify({ error: error.details[0].message }));
          if (!value) return ws.send(JSON.stringify({ error: 'Invalid message format' }));

          messageTypeHandlers[value.event](wss, ws, value.data);
        } catch (e: any) {
          const response = {
            message: 'internal server error',
            error: e?.message,
          };
          ws.close(undefined, JSON.stringify(response));
        }
      });
    });
  });
};
