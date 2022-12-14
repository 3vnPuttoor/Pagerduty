import Command from '../../base'
import {CliUx, Flags} from '@oclif/core'
import chalk from 'chalk'
import getStream from 'get-stream'
import * as utils from '../../utils'

export default class EpOpen extends Command {
  static description = 'Open PagerDuty Escalation policies in the browser'

  static flags = {
    ...Command.flags,
    name: Flags.string({
      char: 'n',
      description: 'Open escalation policies whose names match this string.',
      exclusive: ['ids', 'pipe'],
    }),
    ids: Flags.string({
      char: 'i',
      description: 'The IDs of escalation policies to open.',
      exclusive: ['name', 'pipe'],
      multiple: true,
    }),
    pipe: Flags.boolean({
      char: 'p',
      description: 'Read escalation policy ID\'s from stdin.',
      exclusive: ['ids', 'name'],
    }),
  }

  async run() {
    const {flags} = await this.parse(EpOpen)

    const params: Record<string, any> = {}

    if (!([flags.name, flags.ids, flags.pipe].some(Boolean))) {
      this.error('You must specify one of: -i, -n, -p', {exit: 1})
    }
    let ep_ids: string[] = []
    if (flags.name) {
      params.query = flags.name
      const eps = await this.pd.fetchWithSpinner('escalation_policies', {
        params: params,
        activityDescription: 'Finding escalation policies in PD',
      })
      if (eps.length === 0) {
        this.error(`No escalation policies found matching ${chalk.bold.blue(flags.name)}`, {exit: 1})
      }
      ep_ids = [...ep_ids, ...eps.map((ep: {id: string}) => ep.id)]
    }
    if (flags.ids) {
      ep_ids = [...ep_ids, ...flags.ids]
    }
    if (flags.pipe) {
      const str: string = await getStream(process.stdin)
      ep_ids = [...ep_ids, ...utils.splitDedupAndFlatten([str])]
    }

    const invalid_ids = utils.invalidPagerDutyIDs(ep_ids)
    if (invalid_ids.length > 0) {
      this.error(`Invalid escalation policy IDs ${chalk.bold.blue(invalid_ids.join(', '))}`, {exit: 1})
    }

    if (ep_ids.length === 0) {
      this.error('No escalation policies specified', {exit: 1})
    }

    CliUx.ux.action.start('Finding your PD domain')
    const domain = await this.pd.domain()

    this.log('Escalation Policy URLs:')
    const urlstrings: string[] = ep_ids.map(x => chalk.bold.blue(`https://${domain}.pagerduty.com/escalation_policies/${x}`))
    this.log(urlstrings.join('\n') + '\n')

    CliUx.ux.action.start(`Opening ${ep_ids.length} escalation policies in the browser`)
    try {
      for (const ep_id of ep_ids) {
        await CliUx.ux.open(`https://${domain}.pagerduty.com/escalation_policies/${ep_id}`)
      }
    } catch (error) {
      CliUx.ux.action.stop(chalk.bold.red('failed'))
      this.error('Couldn\'t open browser. Are you running as root?', {exit: 1})
    }
    CliUx.ux.action.stop(chalk.bold.green('done'))
  }
}
