import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

export interface BSPCLIConfig {
    registry: string
    network: 'mainnet' | 'testnet' | 'local'
    private_key: string
    ieo_domain: string
}

const CONFIG_DIR = join(homedir(), '.bsp')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

const DEFAULTS: BSPCLIConfig = {
    registry: 'https://api.biologicalsovereigntyprotocol.com',
    network: 'testnet',
    private_key: '',
    ieo_domain: '',
}

export function loadConfig(): BSPCLIConfig {
    if (!existsSync(CONFIG_FILE)) return { ...DEFAULTS }
    try {
        const raw = readFileSync(CONFIG_FILE, 'utf-8')
        return { ...DEFAULTS, ...JSON.parse(raw) }
    } catch {
        return { ...DEFAULTS }
    }
}

export function saveConfig(config: Partial<BSPCLIConfig>): void {
    if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true })
    const current = loadConfig()
    const merged = { ...current, ...config }
    writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2) + '\n')
}

export function getConfigPath(): string {
    return CONFIG_FILE
}
