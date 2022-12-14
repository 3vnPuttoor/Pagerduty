/* eslint-disable complexity */
import Command from '../../base'
import {CliUx, Flags} from '@oclif/core'
import chalk from 'chalk'
import * as utils from '../../utils'

export default class TeamCreate extends Command {
  static description = 'Create an empty PagerDuty Team. You can add escalation policies and users later with team:ep and team:user'

  static flags = {
    ...Command.flags,
    name: Flags.string({
      char: 'n',
      description: 'The name of the team to add.',
      required: true,
    }),
    description: Flags.string({
      description: 'The description of the team',
    }),
    parent_id: Flags.string({
      char: 'a',
      description: 'The ID of the new team\'s parent team',
      exclusive: ['parent_name'],
    }),
    parent_name: Flags.string({
      char: 'A',
      description: 'The name of the new team\'s parent team',
      exclusive: ['parent_id'],
    }),
    open: Flags.boolean({
      char: 'o',
      description: 'Open the new team in the browser',
    }),
    pipe: Flags.boolean({
      char: 'p',
      description: 'Print the team ID only to stdout, for use with pipes.',
      exclusive: ['open'],
    }),
  }

  async run() {
    const {flags} = await this.parse(TeamCreate)

    const body: any = {
      team: {
        type: 'team',
        name: flags.name,
      },
    }

    if (flags.description) {
      body.team.description = flags.description
    }

    if (flags.parent_id) {
      if (utils.invalidPagerDutyIDs([flags.parent_id]).length > 0) {
        this.error(`Invalid team ID: ${chalk.bold.blue(flags.parent_id)}`, {exit: 1})
      }
      body.team.parent = {
        id: flags.parent_id,
        type: 'team_reference',
      }
    } else if (flags.parent_name) {
      const parent_id = await this.pd.teamIDForName(flags.parent_name)
      if (!parent_id) {
        this.error(`No team was found with the name ${chalk.bold.blue(flags.parent_name)}`, {exit: 1})
      }
      body.team.parent = {
        id: parent_id,
        type: 'team_reference',
      }
    }

    const r = await this.pd.request({
      endpoint: 'teams',
      method: 'POST',
      data: body,
    })

    if (r.isFailure) {
      this.error(`Failed to create team: ${r.getFormattedError()}`, {exit: 1})
    }
    CliUx.ux.action.stop(chalk.bold.green('done'))
    const returned_team = r.getData()

    if (flags.pipe) {
      this.log(returned_team.team.id)
    } else if (flags.open) {
      CliUx.ux.action.start(`Opening ${chalk.bold.blue(returned_team.team.html_url)} in the browser`)
      try {
        await CliUx.ux.open(returned_team.team.html_url)
      } catch (error) {
        CliUx.ux.action.stop(chalk.bold.red('failed!'))
        this.error('Couldn\'t open your browser. Are you running as root?', {exit: 1})
      }
      CliUx.ux.action.stop(chalk.bold.green('done'))
    } else {
      this.log(`Your new team is at ${chalk.bold.blue(returned_team.team.html_url)}`)
    }
  }
}
