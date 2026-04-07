import { Command } from 'commander'
import { CryptoUtils } from '@bsp/sdk'
import { readFileSync } from 'fs'
import { loadConfig } from '../lib/config.js'
import * as api from '../lib/api.js'
import { success, error, info, warn, requireKey, json } from '../lib/output.js'

export function registerExchangeCommands(program: Command) {
    const exchange = program.command('records').description('Submit and read biological records')

    exchange.command('submit')
        .description('Submit BioRecords to a BEO')
        .argument('<beoId>', 'Target BEO UUID')
        .requiredOption('--token <id>', 'ConsentToken ID')
        .requiredOption('--file <path>', 'JSON file with records array')
        .action(async (beoId: string, opts) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const raw = readFileSync(opts.file, 'utf-8')
                const records = JSON.parse(raw)
                if (!Array.isArray(records)) throw new Error('File must contain a JSON array of records')

                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = {
                    function: 'submitRecords',
                    targetBeo: beoId,
                    consentToken: opts.token,
                    recordCount: records.length,
                    nonce, timestamp,
                }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/exchange/records', {
                    targetBeo: beoId,
                    consentToken: opts.token,
                    records,
                    signature,
                    nonce,
                    timestamp,
                })

                success(`${result.record_ids.length} record(s) submitted`)
                info(`Request ID: ${result.request_id}`)
                for (let i = 0; i < result.arweave_txs.length; i++) {
                    info(`  ${result.record_ids[i]} → ${result.arweave_txs[i]}`)
                }
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    exchange.command('read')
        .description('Read BioRecords from a BEO')
        .argument('<beoId>', 'Target BEO UUID')
        .requiredOption('--token <id>', 'ConsentToken ID')
        .option('--categories <list>', 'Filter by categories (comma-separated)')
        .option('--limit <n>', 'Max records', '50')
        .option('--json', 'Output raw JSON')
        .action(async (beoId: string, opts) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = {
                    function: 'readRecords',
                    targetBeo: beoId,
                    consentToken: opts.token,
                    nonce, timestamp,
                }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const params = new URLSearchParams({
                    targetBeo: beoId,
                    consentToken: opts.token,
                    signature,
                    nonce,
                    timestamp,
                    limit: opts.limit,
                })
                if (opts.categories) params.set('categories', opts.categories)

                const result = await api.get(`/api/exchange/records?${params}`)

                if (opts.json) {
                    json(result.records)
                    return
                }

                success(`${result.records.length} record(s) (total: ${result.total})`)
                for (const r of result.records) {
                    console.log()
                    info(`${r.biomarker} = ${r.value} ${r.unit || ''} [${r.category}]`)
                    info(`  collected: ${r.collected_at}  status: ${r.status}`)
                }
                if (result.has_more) warn(`More records available. Use --limit to increase.`)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })

    program.command('export')
        .description('Export all biological data (sovereign portability)')
        .argument('<beoId>', 'BEO UUID')
        .requiredOption('--token <id>', 'ConsentToken ID with EXPORT_DATA intent')
        .option('--format <fmt>', 'Export format: JSON, CSV, FHIR_R4', 'JSON')
        .action(async (beoId: string, opts) => {
            const config = loadConfig()
            requireKey(config.private_key)
            try {
                const nonce = CryptoUtils.generateNonce()
                const timestamp = new Date().toISOString()
                const payload = {
                    function: 'sovereignExport',
                    targetBeo: beoId,
                    consentToken: opts.token,
                    format: opts.format,
                    nonce, timestamp,
                }
                const signature = CryptoUtils.signPayload(payload, config.private_key)

                const result = await api.post('/api/exchange/export', {
                    targetBeo: beoId,
                    consentToken: opts.token,
                    format: opts.format,
                    signature,
                    nonce,
                    timestamp,
                })

                success(`Export complete: ${result.record_count} records in ${result.format}`)
                console.log(result.data)
            } catch (e: any) {
                error(e.message)
                process.exit(1)
            }
        })
}
