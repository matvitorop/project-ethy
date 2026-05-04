import * as signalR from '@microsoft/signalr'

const API_BASE_URL = 'http://localhost:5274'

let connection: signalR.HubConnection | null = null

export function getChatConnection(): signalR.HubConnection {
    if (!connection) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/hubs/chat`, {
                withCredentials: true,
            })
            .withAutomaticReconnect()
            .build()
    }
    return connection
}

export async function startChatConnection(): Promise<void> {
    const conn = getChatConnection()
    if (conn.state === signalR.HubConnectionState.Disconnected) {
        await conn.start()
    }
}

export async function stopChatConnection(): Promise<void> {
    if (connection?.state === signalR.HubConnectionState.Connected) {
        await connection.stop()
    }
}