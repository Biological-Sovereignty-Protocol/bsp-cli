import { Command } from 'commander'
import { loadConfig, saveConfig, getConfigPath } from '../lib/config.js'
import { success, error, table, info } from '../lib/output.js'

const VALID_KEYS = ['registry', 'network', 'private-key', 'ieo-domain'] as const

export function registerConfigCommands(program: Command) {
    const config = program.command('config').description('Manage CLI configuration (~/.bsp/config.json)')

    config.command('set')
        .description('Set a config value')
        .argument('<key>', `Config key: ${VALID_KEYS.join(', ')}`)
        .argument('<value>', 'Config value')
        .action((key: string, value: string) => {
            const keyMap: Record<string, string> = {
                'registry': 'registry',
                'network': 'network',
                'private-key': 'private_key',
                'ieo-domain': 'ieo_domain',
            }
            const mapped = keyMap[key]
            if (!mapped) {
                error(`Unknown key: ${key}. Valid keys: ${VALID_KEYS.join(', ')}`)
                process.exit(1)
            }
            if (key === 'network' && !['mainnet', 'testnet', 'local'].includes(value)) {
                error('Network must be: mainnet, testnet, or local')
                process.exit(1)
            }
            saveConfig({ [mapped]: value } as any)
            success(`${key} = ${key === 'private-key' ? value.slice(0, 8) + '...' : value}`)
        })

    config.command('get')
        .description('Get a config value')
        .argument('<key>', 'Config key')
        .action((key: string) => {
            const cfg = loadConfig()
            const keyMap: Record<string, string> = {
                'registry': 'registry',
                'network': 'network',
                'private-key': 'private_key',
                'ieo-domain': 'ieo_domain',
            }
            const mapped = keyMap[key] as keyof typeof cfg
            if (!mapped || !(mapped in cfg)) {
                error(`Unknown key: ${key}`)
                process.exit(1)
            }
            const val = cfg[mapped]
            if (key === 'private-key' && val) {
                info(`${key} = ${(val as string).slice(0, 8)}... (hidden)`)
            } else {
                info(`${key} = ${val || '(not set)'}`)
            }
        })

    config.command('show')
        .description('Show all configuration')
        .action(() => {
            const cfg = loadConfig()
            success(`Config: ${getConfigPath()}`)
            console.log()
            table({
                'Registry': cfg.registry,
                'Network': cfg.network,
                'Private Key': cfg.private_key ? cfg.private_key.slice(0, 8) + '... (set)' : '(not set)',
                'IEO Domain': cfg.ieo_domain || '(not set)',
            })
        })

    config.command('path')
        .description('Print config file path')
        .action(() => {
            info(getConfigPath())
        })
}
