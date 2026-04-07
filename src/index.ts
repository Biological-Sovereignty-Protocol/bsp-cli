#!/usr/bin/env node

import { Command } from 'commander'
import { registerBEOCommands } from './commands/beo.js'
import { registerConsentCommands } from './commands/consent.js'
import { registerIEOCommands } from './commands/ieo.js'
import { registerExchangeCommands } from './commands/exchange.js'
import { registerConfigCommands } from './commands/config.js'

const program = new Command()

program
    .name('bsp')
    .version('1.0.0')
    .description('Biological Sovereignty Protocol — CLI\nhttps://biologicalsovereigntyprotocol.com')

registerBEOCommands(program)
registerConsentCommands(program)
registerIEOCommands(program)
registerExchangeCommands(program)
registerConfigCommands(program)

program.parse()
