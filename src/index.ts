#!/usr/bin/env node

import { Command } from 'commander'
import { registerBEOCommands } from './commands/beo.js'
import { registerConsentCommands } from './commands/consent.js'
import { registerIEOCommands } from './commands/ieo.js'
import { registerExchangeCommands } from './commands/exchange.js'
import { registerConfigCommands } from './commands/config.js'
import { setOutputFormat } from './lib/output.js'

const program = new Command()

program
    .name('bsp')
    .version('1.0.0')
    .description('Biological Sovereignty Protocol — CLI\nhttps://biologicalsovereigntyprotocol.com')
    .option('--output <format>', 'Output format: table, json', 'table')
    .hook('preAction', (thisCommand) => {
        const opts = thisCommand.opts()
        if (opts.output) setOutputFormat(opts.output as 'table' | 'json')
    })

registerBEOCommands(program)
registerConsentCommands(program)
registerIEOCommands(program)
registerExchangeCommands(program)
registerConfigCommands(program)

program
    .command('completions [shell]')
    .description('Print shell completion script (bash|zsh). Usage: eval "$(bsp completions bash)"')
    .action((shell = 'bash') => {
        const cmds = ['beo', 'ieo', 'consent', 'record', 'config', 'completions']
        if (shell === 'zsh') {
            console.log(`compdef '_arguments "1: :(${cmds.join(' ')})"' bsp`)
        } else {
            console.log(`complete -W "${cmds.join(' ')}" bsp`)
        }
    })

program.parse()
