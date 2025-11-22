import { io } from 'socket.io-client';

// Connect to the same origin
export const socket = io();