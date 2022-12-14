import Command from '../../../base'
import {CliUx, Flags} from '@oclif/core'
import chalk from 'chalk'
import * as utils from '../../../utils'
import jp from 'jsonpath'
import parsePhoneNumber from 'libphonenumber-js'

const types: Record<string, string> = {
  phone_contact_method: 'Phone',
  push_notification_contact_method: 'Push',
  email_contact_method: 'Email',
  sms_contact_method: 'SMS',
}

export default class UserContactList extends Command {
  static description = 'List a PagerDuty User\'s contact methods.'

  static flags = {
    ...Command.flags,
    id: Flags.string({
      char: 'i',
      description: 'Show contacts for the user with this ID.',
      exclusive: ['email'],
    }),
    email: Flags.string({
      char: 'e',
      description: 'Show contacts for the user with this login email.',
      exclusive: ['id'],
    }),
    keys: Flags.string({
      char: 'k',
      description: 'Additional fields to display. Specify multiple times for multiple fields.',
      multiple: true,
    }),
    json: Flags.boolean({
      char: 'j',
      description: 'output full details as JSON',
      exclusive: ['columns', 'filter', 'sort', 'csv', 'extended'],
    }),
    pipe: Flags.boolean({
      char: 'p',
      description: 'Print contact ID\'s only to stdout, for use with pipes.',
      exclusive: ['columns', 'sort', 'csv', 'extended', 'json'],
    }),
    delimiter: Flags.string({
      char: 'd',
      description: 'Delimiter for fields that have more than one value',
      default: '\n',
    }),
    ...CliUx.ux.table.flags(),
  }

  async run() {
    const {flags} = await this.parse(UserContactList)

    let userID
    if (flags.id) {
      userID = flags.id
    } else if (flags.email) {
      CliUx.ux.action.start(`Finding PD user ${chalk.bold.blue(flags.email)}`)
      userID = await this.pd.userIDForEmail(flags.email)
      if (!userID) {
        CliUx.ux.action.stop(chalk.bold.red('failed!'))
        this.error(`No user was found for the email "${flags.email}"`, {exit: 1})
      }
    } else {
      this.error('You must specify one of: -i, -e', {exit: 1})
    }

    const contact_methods = await this.pd.fetchWithSpinner(`users/${userID}/contact_methods`, {
      activityDescription: `Getting contact methods for user ${chalk.bold.blue(userID)}`,
    })

    if (flags.json) {
      await utils.printJsonAndExit(contact_methods)
    }

    const columns: Record<string, object> = {
      id: {
        header: 'ID',
      },
      label: {
      },
      type: {
        get: (row: Record<string, string>) => {
          return types[row.type] || row.type
        },
      },
      address: {
        get: (row: Record<string, any>) => {
          if (row.type === 'phone_contact_method' || row.type === 'sms_contact_method') {
            const number = parsePhoneNumber(`+${row.country_code} ${row.address}`)
            return number?.formatInternational()
          }
          return row.address
        },
      },
    }

    if (flags.keys) {
      for (const key of flags.keys) {
        columns[key] = {
          header: key,
          get: (row: any) => utils.formatField(jp.query(row, key), flags.delimiter),
        }
      }
    }

    const options = {
      ...flags, // parsed flags
    }
    if (flags.pipe) {
      for (const k of Object.keys(columns)) {
        if (k !== 'id') {
          const colAny = columns[k] as any
          colAny.extended = true
        }
      }
      options['no-header'] = true
    }
    CliUx.ux.table(contact_methods, columns, options)
  }
}
