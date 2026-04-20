import { Command } from 'commander'
import { CryptoUtils } from '@biological-sovereignty-protocol/sdk'
import { loadConfig } from '../lib/config.js'
import * as api from '../lib/api.js'
import { success, error, table, info, warn, requireKey, json, getOutputFormat } from '../lib/output.js'

export function registerBEOCommands(program: Command) {
    const beo = program.command('create')
        .description('Create a new BEO (Biological Entity Object)')
        .argument('<domain>', 'Domain name (e.g. andre.bsp)')
        .action(async (domain: string) => {
            try {
                if (!domain.endsWith('.bsp')) domain += '.bsp'

                const { publicKey, privateKey, seed } = CryptoUtils.generateKeyPair()
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()

                const payload = { function: 'createBEO', domain, publicKey, recovery: null, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, privateKey)

                const result = await api.post('/api/relayer/beo', {
                    domain, publicKey, recovery: null, signature, nonce, timestamp,
                })

                success(`BEO created: ${domain}`)
                console.log()
                table({
                    'Domain': domain,
                    'BEO ID': result.transactionId,
                    'Public Key': publicKey.slice(0, 16) + '...',
                    'TX': result.transactionId,
                })
                console.log()
                warn('CRITICAL — Store these securely. They are shown ONCE.')
                console.log()
                info(`Private Key: ${privateKey}`)
                info(`Seed:        ${seed}`)
                console.log()
                info('Set your key: bsp config set private-key ' + privateKey)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    program.command('resolve')
        .description('Resolve a .bsp domain to its BEO')
        .argument('<domain>', 'Domain name (e.g. andre.bsp)')
        .action(async (domain: string) => {
            try {
                if (!domain.endsWith('.bsp')) domain += '.bsp'
                const result = await api.get(`/api/beos/domain/${encodeURIComponent(domain)}`)
                if (getOutputFormat() === 'json') {
                    json(result.beo)
                    return
                }
                success(`BEO found: ${domain}`)
                console.log()
                table({
                    'BEO ID': result.beo.beo_id,
                    'Domain': result.beo.domain,
                    'Status': result.beo.status,
                    'Public Key': result.beo.public_key?.slice(0, 16) + '...',
                    'Created': result.beo.created_at,
                    'Key Version': result.beo.key_version,
                })
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    program.command('lock')
        .description('Emergency lock a BEO')
        .argument('<beoId>', 'BEO UUID')
        .action(async (beoId: string) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = { function: 'lockBEO', beoId, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/relayer/beo/lock', { beoId, signature, nonce, timestamp })
                success(`BEO locked: ${beoId}`)
                info(`TX: ${result.transactionId}`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    program.command('unlock')
        .description('Unlock a locked BEO')
        .argument('<beoId>', 'BEO UUID')
        .action(async (beoId: string) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = { function: 'unlockBEO', beoId, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/relayer/beo/unlock', { beoId, signature, nonce, timestamp })
                success(`BEO unlocked: ${beoId}`)
                info(`TX: ${result.transactionId}`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    program.command('destroy')
        .description('IRREVERSIBLE — Destroy a BEO (LGPD/GDPR right to erasure)')
        .argument('<beoId>', 'BEO UUID')
        .option('--confirm', 'Skip confirmation prompt')
        .action(async (beoId: string, opts: { confirm?: boolean }) => {
            const config = loadConfig()
            requireKey(config.private_key)

            if (!opts.confirm) {
                warn('This will PERMANENTLY destroy the BEO:')
                warn('  - Public key nullified (cryptographic erasure)')
                warn('  - All ConsentTokens revoked')
                warn('  - Domain released')
                warn('  - Recovery config wiped')
                console.log()
                warn('This action CANNOT be undone.')
                console.log()
                error('Add --confirm to execute.')
                process.exit(1)
            }

            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = { function: 'destroyBEO', beoId, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/relayer/beo/destroy', { beoId, signature, nonce, timestamp })
                success(`BEO destroyed: ${beoId}`)
                info(`TX: ${result.transactionId}`)
                warn('Delete your local private key now.')
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    program.command('rotate-key')
        .description('Rotate the BEO Ed25519 key')
        .argument('<beoId>', 'BEO UUID')
        .action(async (beoId: string) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const newKp = CryptoUtils.generateKeyPair()
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = { function: 'rotateKey', beoId, newPublicKey: newKp.publicKey, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/relayer/beo/rotate-key', {
                    beoId, newPublicKey: newKp.publicKey, signature, nonce, timestamp,
                })

                success(`Key rotated for BEO: ${beoId}`)
                info(`TX: ${result.transactionId}`)
                console.log()
                warn('CRITICAL — New key generated. Update your config:')
                info(`bsp config set private-key ${newKp.privateKey}`)
                info(`New seed: ${newKp.seed}`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })
}
