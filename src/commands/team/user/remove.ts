/* eslint-disable complexity */
import Command from '../../../base'
import {flags} from '@oclif/command'
import cli from 'cli-ux'
import chalk from 'chalk'
import * as utils from '../../../utils'
import {PD} from '../../../pd'

export default class TeamUserRemove extends Command {
  static description = 'Remove PagerDuty users from Teams'

  static flags = {
    ...Command.flags,
    name: flags.string({
      char: 'n',
      description: 'Select teams whose names contain the given text',
    }),
    ids: flags.string({
      char: 'i',
      description: 'The IDs of teams to remove members from.',
      exclusive: ['name', 'pipe'],
      multiple: true,
    }),
    user_ids: flags.string({
      char: 'u',
      description: 'Remove a user with this ID. Specify multiple times for multiple users.',
      multiple: true,
    }),
    user_emails: flags.string({
      char: 'U',
      description: 'Remove a user with this email. Specify multiple times for multiple users.',
      multiple: true,
    }),
  }

  async run() {
    const {flags} = this.parse(TeamUserRemove)

    const params: Record<string, any> = {}

    if (flags.name) {
      params.query = flags.name
    }

    let team_ids = []
    if (flags.name) {
      params.query = flags.name
      cli.action.start('Finding teams in PD')
      const teams = await this.pd.fetch('teams', {params: params})
      if (teams.length === 0) {
        cli.action.stop(chalk.bold.red('no teams found matching ') + chalk.bold.blue(flags.name))
        this.exit(0)
      }
      for (const team of teams) {
        team_ids.push(team.id)
      }
    } else if (flags.ids) {
      const invalid_ids = utils.invalidPagerDutyIDs(flags.ids)
      if (invalid_ids.length > 0) {
        this.error(`Invalid team IDs ${chalk.bold.blue(invalid_ids.join(', '))}`, {exit: 1})
      }
      team_ids = flags.ids
    } else {
      this.error('You must specify one of: -i, -n', {exit: 1})
    }

    if (team_ids.length === 0) {
      cli.action.stop(chalk.bold.red('no teams specified'))
      this.exit(0)
    }

    let user_ids: string[] = []
    if (flags.user_ids) {
      user_ids = [...user_ids, ...flags.user_ids]
    }
    if (flags.user_emails) {
      for (const email of flags.user_emails) {
        // eslint-disable-next-line no-await-in-loop
        const user_id = await this.pd.userIDForEmail(email)
        if (user_id === null) {
          this.error(`No user was found with the email ${chalk.bold.blue(email)}`, {exit: 1})
        } else {
          user_ids.push(user_id)
        }
      }
    }
    user_ids = [...new Set(user_ids)]

    const invalid_ids = utils.invalidPagerDutyIDs(user_ids)
    if (invalid_ids && invalid_ids.length > 0) {
      this.error(`Invalid User ID's: ${invalid_ids.join(', ')}`, {exit: 1})
    }

    if (user_ids.length === 0) {
      this.error('No users specified. Please specify some users using -u, -U')
    }

    const requests: PD.Request[] = []

    for (const team_id of team_ids) {
      for (const user_id of user_ids) {
        requests.push({
          endpoint: `teams/${team_id}/users/${user_id}`,
          method: 'DELETE',
        })
      }
    }

    const r = await this.pd.batchedRequestWithSpinner(requests, {
      activityDescription: `Removing ${user_ids.length} users from ${team_ids.length} teams`,
    })
    for (const failure of r.getFailedIndices()) {
      const f = requests[failure] as any
      const [, team_id, , user_id] = f.endpoint.split('/')
      // eslint-disable-next-line no-console
      console.error(`${chalk.bold.red('Failed to remove user ')}${chalk.bold.blue(user_id)}${chalk.bold.red(' from team ')}${chalk.bold.blue(team_id)}: ${r.results[failure].getFormattedError()}`)
    }
  }
}
