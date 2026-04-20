type OutputFormat = 'table' | 'json'

let _outputFormat: OutputFormat = 'table'

export function setOutputFormat(fmt: OutputFormat): void {
    _outputFormat = fmt
}

export function getOutputFormat(): OutputFormat {
    return _outputFormat
}

export function success(msg: string): void {
    if (_outputFormat === 'json') return
    console.log(`\x1b[32m✓\x1b[0m ${msg}`)
}

export function error(msg: string): void {
    console.error(`\x1b[31m✗\x1b[0m ${msg}`)
}

export function warn(msg: string): void {
    if (_outputFormat === 'json') return
    console.log(`\x1b[33m!\x1b[0m ${msg}`)
}

export function info(msg: string): void {
    if (_outputFormat === 'json') return
    console.log(`  ${msg}`)
}

export function table(rows: Record<string, string | number | boolean | null>): void {
    if (_outputFormat === 'json') {
        console.log(JSON.stringify(rows, null, 2))
        return
    }
    const maxKey = Math.max(...Object.keys(rows).map(k => k.length))
    for (const [key, val] of Object.entries(rows)) {
        const label = key.padEnd(maxKey)
        console.log(`  \x1b[2m${label}\x1b[0m  ${val ?? '\x1b[2m—\x1b[0m'}`)
    }
}

export function json(data: unknown): void {
    console.log(JSON.stringify(data, null, 2))
}

export function requireKey(privateKey: string): void {
    if (!privateKey) {
        error('No private key configured. Run: bsp config set private-key <hex>')
        process.exit(1)
    }
}
