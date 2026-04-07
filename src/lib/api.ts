import { loadConfig } from './config.js'

export class ApiError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message)
        this.name = 'ApiError'
    }
}

export async function post<T = any>(path: string, body: Record<string, unknown>): Promise<T> {
    const config = loadConfig()
    const res = await fetch(`${config.registry}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
    })
    const data = await res.json() as any
    if (!res.ok) throw new ApiError(data?.error || `HTTP ${res.status}`, res.status)
    return data as T
}

export async function get<T = any>(path: string): Promise<T> {
    const config = loadConfig()
    const res = await fetch(`${config.registry}${path}`, {
        signal: AbortSignal.timeout(30_000),
    })
    const data = await res.json() as any
    if (!res.ok) throw new ApiError(data?.error || `HTTP ${res.status}`, res.status)
    return data as T
}

export async function del<T = any>(path: string, body?: Record<string, unknown>): Promise<T> {
    const config = loadConfig()
    const options: RequestInit = {
        method: 'DELETE',
        signal: AbortSignal.timeout(30_000),
    }
    if (body) {
        options.headers = { 'Content-Type': 'application/json' }
        options.body = JSON.stringify(body)
    }
    const res = await fetch(`${config.registry}${path}`, options)
    const data = await res.json() as any
    if (!res.ok) throw new ApiError(data?.error || `HTTP ${res.status}`, res.status)
    return data as T
}
