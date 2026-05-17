import * as signalR from '@microsoft/signalr'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

let connection: signalR.HubConnection | null = null

export function getNotificationConnection(): signalR.HubConnection {
    if (!connection) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/hubs/notifications`, {
                withCredentials: true,
            })
            .withAutomaticReconnect()
            .build()
    }
    return connection
}

export async function startNotificationConnection(): Promise<void> {
    const conn = getNotificationConnection()
    if (conn.state === signalR.HubConnectionState.Disconnected) {
        await conn.start()
    }
}

export async function stopNotificationConnection(): Promise<void> {
    if (connection?.state === signalR.HubConnectionState.Connected) {
        await connection.stop()
    }
}