import { Command } from 'commander'
import { CryptoUtils } from '@biological-sovereignty-protocol/sdk'
import { loadConfig } from '../lib/config.js'
import * as api from '../lib/api.js'
import { success, error, table, info, warn, requireKey, json } from '../lib/output.js'

export function registerConsentCommands(program: Command) {
    const consent = program.command('consent').description('Manage ConsentTokens')

    consent.command('grant')
        .description('Issue a ConsentToken to an IEO')
        .argument('<beoId>', 'BEO UUID')
        .argument('<ieoId>', 'IEO UUID')
        .requiredOption('--intents <list>', 'Comma-separated intents (SUBMIT_RECORD,READ_RECORDS,...)')
        .option('--categories <list>', 'Comma-separated BSP categories (BSP-LA,BSP-CV,...)')
        .option('--days <n>', 'Expiration in days', parseInt)
        .action(async (beoId: string, ieoId: string, opts) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const scope = {
                    intents: opts.intents.split(','),
                    categories: opts.categories?.split(',') ?? [],
                }
                const expiresInDays = opts.days ?? null
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()

                const payload = { function: 'grantConsent', beoId, ieoId, scope, expiresInDays, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/relayer/consent', {
                    beoId, ieoId, scope, expiresInDays, signature, nonce, timestamp,
                })

                success('ConsentToken issued')
                table({
                    'Token ID': result.transactionId,
                    'BEO': beoId,
                    'IEO': ieoId,
                    'Intents': opts.intents,
                    'Expires': expiresInDays ? `${expiresInDays} days` : 'permanent',
                })
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    consent.command('revoke')
        .description('Revoke a single ConsentToken')
        .argument('<tokenId>', 'Token ID')
        .argument('<beoId>', 'BEO UUID (owner)')
        .action(async (tokenId: string, beoId: string) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = { function: 'revokeToken', tokenId, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.del(`/api/consent/${encodeURIComponent(tokenId)}`, {
                    beoId, signature, nonce, timestamp,
                })

                success(`Token revoked: ${tokenId}`)
                info(`TX: ${result.transactionId}`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    consent.command('revoke-all')
        .description('Emergency — revoke ALL tokens for a BEO')
        .argument('<beoId>', 'BEO UUID')
        .option('--confirm', 'Skip confirmation')
        .action(async (beoId: string, opts: { confirm?: boolean }) => {
            const config = loadConfig()
            requireKey(config.private_key)

            if (!opts.confirm) {
                warn('This will revoke ALL active ConsentTokens for this BEO.')
                warn('No institution will be able to access any data after this.')
                error('Add --confirm to execute.')
                process.exit(1)
            }

            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = { function: 'revokeAllTokens', beoId, nonce, timestamp }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.del('/api/consent/all', {
                    beoId, signature, nonce, timestamp,
                })

                success(`All tokens revoked for BEO: ${beoId}`)
                info(`Revoked: ${result.revoked_count} tokens`)
                info(`TX: ${result.transactionId}`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    consent.command('verify')
        .description('Verify a ConsentToken')
        .argument('<tokenId>', 'Token ID')
        .action(async (tokenId: string) => {
            try {
                const result = await api.get(`/api/consent/${encodeURIComponent(tokenId)}`)
                if (result.valid) {
                    success('Token is valid')
                    table({
                        'Token ID': tokenId,
                        'BEO': result.token?.beo_id,
                        'IEO': result.token?.ieo_id,
                        'Intents': result.token?.scope?.intents?.join(', '),
                        'Expires': result.token?.expires_at ?? 'permanent',
                    })
                } else {
                    warn(`Token invalid: ${result.reason}`)
                }
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    consent.command('list')
        .description('List consent history for a BEO domain')
        .argument('<domain>', 'BEO domain (e.g. andre.bsp)')
        .action(async (domain: string) => {
            try {
                if (!domain.endsWith('.bsp')) domain += '.bsp'
                const result = await api.get(`/api/consent/history/${encodeURIComponent(domain)}`)
                if (!result.tokens || result.tokens.length === 0) {
                    info('No consent tokens found.')
                    return
                }
                success(`${result.tokens.length} token(s) for ${domain}`)
                for (const t of result.tokens) {
                    console.log()
                    table({
                        'Token ID': t.token_id,
                        'IEO': t.ieo_id,
                        'Status': t.revoked_at ? 'REVOKED' : 'ACTIVE',
                        'Intents': t.scope?.intents?.join(', '),
                        'Granted': t.granted_at,
                        'Expires': t.expires_at ?? 'permanent',
                    })
                }
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })
}
