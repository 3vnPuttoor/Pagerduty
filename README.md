pagerduty-cli
=============

PagerDuty Command Line Interface

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/pagerduty-cli.svg)](https://npmjs.org/package/pagerduty-cli)
[![Downloads/week](https://img.shields.io/npm/dw/pagerduty-cli.svg)](https://npmjs.org/package/pagerduty-cli)
[![License](https://img.shields.io/npm/l/pagerduty-cli.svg)](https://github.com/martindstone/pagerduty-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g pagerduty-cli
$ pd COMMAND
running command...
$ pd (-v|--version|version)
pagerduty-cli/0.0.1 darwin-x64 node-v12.18.3
$ pd --help [COMMAND]
USAGE
  $ pd COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`pd auth:get`](#pd-authget)
* [`pd auth:set`](#pd-authset)
* [`pd auth:web`](#pd-authweb)
* [`pd help [COMMAND]`](#pd-help-command)
* [`pd incident:ack`](#pd-incidentack)
* [`pd incident:list`](#pd-incidentlist)
* [`pd incident:resolve`](#pd-incidentresolve)
* [`pd user:list`](#pd-userlist)
* [`pd user:set`](#pd-userset)

## `pd auth:get`

Get PagerDuty Auth token

```
USAGE
  $ pd auth:get

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/auth/get.ts](https://github.com/martindstone/pagerduty-cli/blob/v0.0.1/src/commands/auth/get.ts)_

## `pd auth:set`

Set PagerDuty Auth token

```
USAGE
  $ pd auth:set

OPTIONS
  -h, --help         show CLI help
  -t, --token=token  A PagerDuty API token
```

_See code: [src/commands/auth/set.ts](https://github.com/martindstone/pagerduty-cli/blob/v0.0.1/src/commands/auth/set.ts)_

## `pd auth:web`

Authenticate with PagerDuty in the browser

```
USAGE
  $ pd auth:web

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/auth/web.ts](https://github.com/martindstone/pagerduty-cli/blob/v0.0.1/src/commands/auth/web.ts)_

## `pd help [COMMAND]`

display help for pd

```
USAGE
  $ pd help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `pd incident:ack`

Acknowledge PagerDuty Incidents

```
USAGE
  $ pd incident:ack

OPTIONS
  -h, --help     show CLI help
  -i, --ids=ids  Incident ID's to acknowledge. Specify multiple times for multiple incidents.
  -m, --me       Acknowledge all incidents assigned to me
```

_See code: [src/commands/incident/ack.ts](https://github.com/martindstone/pagerduty-cli/blob/v0.0.1/src/commands/incident/ack.ts)_

## `pd incident:list`

List PagerDuty Incidents

```
USAGE
  $ pd incident:list

OPTIONS
  -S, --services=services                         Service names to include. Specify multiple times for multiple
                                                  services.

  -e, --assignees=assignees                       Return only incidents assigned to this PD login email. Specify
                                                  multiple times for multiple assignees.

  -h, --help                                      show CLI help

  -j, --json                                      output full details as JSON

  -m, --me                                        Return only incidents assigned to me

  -s, --statuses=triggered|acknowledged|resolved  [default: triggered,acknowledged,resolved] Return only incidents with
                                                  the given statuses. Specify multiple times for multiple statuses.

  -t, --teams=teams                               Team names to include. Specify multiple times for multiple teams.

  -u, --urgencies=high|low                        [default: high,low] Urgencies to include.

  -x, --extended                                  show extra columns

  --columns=columns                               only show provided columns (comma-separated)

  --csv                                           output is csv format [alias: --output=csv]

  --filter=filter                                 filter property by partial string matching, ex: name=foo

  --no-header                                     hide table header from output

  --no-truncate                                   do not truncate output to fit screen

  --output=csv|json|yaml                          output in a more machine friendly format

  --sort=sort                                     property to sort by (prepend '-' for descending)
```

_See code: [src/commands/incident/list.ts](https://github.com/martindstone/pagerduty-cli/blob/v0.0.1/src/commands/incident/list.ts)_

## `pd incident:resolve`

Resolve PagerDuty Incidents

```
USAGE
  $ pd incident:resolve

OPTIONS
  -h, --help     show CLI help
  -i, --ids=ids  Incident ID's to resolve. Specify multiple times for multiple incidents.
  -m, --me       Resolve all incidents assigned to me
```

_See code: [src/commands/incident/resolve.ts](https://github.com/martindstone/pagerduty-cli/blob/v0.0.1/src/commands/incident/resolve.ts)_

## `pd user:list`

List PagerDuty Users

```
USAGE
  $ pd user:list

OPTIONS
  -h, --help              show CLI help
  -j, --json              output full details as JSON
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)
```

_See code: [src/commands/user/list.ts](https://github.com/martindstone/pagerduty-cli/blob/v0.0.1/src/commands/user/list.ts)_

## `pd user:set`

Set PagerDuty User attributes

```
USAGE
  $ pd user:set

OPTIONS
  -e, --email=email  (required) User's login email
  -h, --help         show CLI help
  -k, --key=key      (required) Attribute key to set
  -v, --value=value  (required) Attribute value to set
```

_See code: [src/commands/user/set.ts](https://github.com/martindstone/pagerduty-cli/blob/v0.0.1/src/commands/user/set.ts)_
<!-- commandsstop -->