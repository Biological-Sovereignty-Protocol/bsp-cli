import { Command } from 'commander'
import { CryptoUtils } from '@bsp/sdk'
import { loadConfig } from '../lib/config.js'
import * as api from '../lib/api.js'
import { success, error, table, info, warn, requireKey } from '../lib/output.js'

export function registerIEOCommands(program: Command) {
    const ieo = program.command('ieo').description('Manage Institutional Entity Objects')

    ieo.command('create')
        .description('Register a new IEO on the protocol')
        .argument('<domain>', 'IEO domain (e.g. fleury.bsp)')
        .requiredOption('--type <type>', 'IEO type (LAB, HOSPITAL, WEARABLE, PHYSICIAN, INSURER, RESEARCH, PLATFORM)')
        .requiredOption('--name <name>', 'Display name')
        .action(async (domain: string, opts) => {
            try {
                if (!domain.endsWith('.bsp')) domain += '.bsp'

                const { publicKey, privateKey, seed } = CryptoUtils.generateKeyPair()
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()

                const payload = { function: 'createIEO', domain, ieoType: opts.type, displayName: opts.name, publicKey, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, privateKey)

                const result = await api.post('/api/ieo', {
                    domain, ieoType: opts.type, displayName: opts.name, publicKey, signature, nonce, timestamp,
                })

                success(`IEO created: ${domain}`)
                console.log()
                table({
                    'Domain': domain,
                    'Type': opts.type,
                    'IEO ID': result.transactionId,
                    'Public Key': publicKey.slice(0, 16) + '...',
                })
                console.log()
                warn('CRITICAL — Store these securely:')
                info(`Private Key: ${privateKey}`)
                info(`Seed:        ${seed}`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    ieo.command('lock')
        .description('Emergency lock an IEO')
        .argument('<ieoId>', 'IEO UUID')
        .action(async (ieoId: string) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = { function: 'lockIEO', ieoId, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/ieo/lock', { ieoId, signature, nonce, timestamp })
                success(`IEO locked: ${ieoId}`)
                info(`TX: ${result.transactionId}`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    ieo.command('unlock')
        .description('Unlock a locked IEO')
        .argument('<ieoId>', 'IEO UUID')
        .action(async (ieoId: string) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = { function: 'unlockIEO', ieoId, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/ieo/unlock', { ieoId, signature, nonce, timestamp })
                success(`IEO unlocked: ${ieoId}`)
                info(`TX: ${result.transactionId}`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    ieo.command('destroy')
        .description('IRREVERSIBLE — Destroy an IEO')
        .argument('<ieoId>', 'IEO UUID')
        .option('--confirm', 'Skip confirmation')
        .action(async (ieoId: string, opts: { confirm?: boolean }) => {
            const config = loadConfig()
            requireKey(config.private_key)

            if (!opts.confirm) {
                warn('This will PERMANENTLY destroy the IEO.')
                error('Add --confirm to execute.')
                process.exit(1)
            }

            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = { function: 'destroyIEO', ieoId, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/ieo/destroy', { ieoId, signature, nonce, timestamp })
                success(`IEO destroyed: ${ieoId}`)
                info(`TX: ${result.transactionId}`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    ieo.command('list')
        .description('List IEOs with optional filters')
        .option('--type <type>', 'Filter by IEO type')
        .option('--status <status>', 'Filter by status')
        .option('--cert <level>', 'Filter by certification level')
        .action(async (opts) => {
            try {
                const params = new URLSearchParams()
                if (opts.type) params.set('ieoType', opts.type)
                if (opts.status) params.set('status', opts.status)
                if (opts.cert) params.set('certLevel', opts.cert)
                const qs = params.toString()

                const result = await api.get(`/api/ieos${qs ? '?' + qs : ''}`)
                success(`${result.count} IEO(s) found`)
                for (const ieo of result.ieos) {
                    console.log()
                    table({
                        'IEO ID': ieo.ieo_id,
                        'Domain': ieo.domain,
                        'Type': ieo.ieo_type,
                        'Name': ieo.display_name,
                        'Status': ieo.status,
                        'Cert': ieo.certification?.level,
                    })
                }
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    ieo.command('get')
        .description('Get IEO details by ID')
        .argument('<ieoId>', 'IEO UUID')
        .action(async (ieoId: string) => {
            try {
                const result = await api.get(`/api/ieos/${ieoId}`)
                success(`IEO: ${result.ieo.domain}`)
                table({
                    'IEO ID': result.ieo.ieo_id,
                    'Domain': result.ieo.domain,
                    'Type': result.ieo.ieo_type,
                    'Name': result.ieo.display_name,
                    'Status': result.ieo.status,
                    'Certification': result.ieo.certification?.level,
                    'Created': result.ieo.created_at,
                    'Key Version': result.ieo.key_version,
                })
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })
}
