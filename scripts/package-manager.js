import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function parseArgs(argv) {
  const [action, ...rest] = argv
  const options = {
    action,
    dryRun: false,
    manager: undefined,
  }

  for (let index = 0; index < rest.length; index += 1) {
    const currentArg = rest[index]

    if (currentArg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (currentArg === '--manager') {
      options.manager = rest[index + 1]
      index += 1
    }
  }

  return options
}

function detectManager(manualManager) {
  if (manualManager) {
    return manualManager
  }

  const userAgent = process.env.npm_config_user_agent || ''
  const packageManagerName = userAgent.split(' ')[0]?.split('/')[0]

  if (
    packageManagerName === 'pnpm' ||
    packageManagerName === 'yarn' ||
    packageManagerName === 'npm'
  ) {
    return packageManagerName
  }

  const lockFiles = [
    { fileName: 'pnpm-lock.yaml', manager: 'pnpm' },
    { fileName: 'yarn.lock', manager: 'yarn' },
    { fileName: 'package-lock.json', manager: 'npm' },
  ]

  const matchedLockFile = lockFiles.find(({ fileName }) =>
    fs.existsSync(path.join(rootDir, fileName)),
  )

  return matchedLockFile?.manager || 'npm'
}

function getCommand(manager, action) {
  if (action === 'install') {
    return {
      command: manager,
      args: ['install'],
    }
  }

  if (action === 'clean-and-prune') {
    if (manager === 'pnpm') {
      return {
        command: 'pnpm',
        args: ['store', 'prune'],
      }
    }

    if (manager === 'yarn') {
      return {
        command: 'yarn',
        args: ['cache', 'clean'],
      }
    }

    return {
      command: 'npm',
      args: ['cache', 'verify'],
    }
  }

  throw new Error(`Unsupported action: ${action}`)
}

function removeNodeModules() {
  fs.rmSync(path.join(rootDir, 'node_modules'), {
    recursive: true,
    force: true,
  })
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  })

  if (result.error) {
    throw result.error
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status)
  }
}

function main() {
  const { action, dryRun, manager: manualManager } = parseArgs(process.argv.slice(2))

  if (!action) {
    throw new Error('Missing action. Use `install` or `clean-and-prune`.')
  }

  const manager = detectManager(manualManager)
  const { command, args } = getCommand(manager, action)

  if (dryRun) {
    const commandText = [command, ...args].join(' ')
    if (action === 'clean-and-prune') {
      console.log(`[dry-run] remove: ${path.join(rootDir, 'node_modules')}`)
    }
    console.log(`[dry-run] manager: ${manager}`)
    console.log(`[dry-run] command: ${commandText}`)
    return
  }

  if (action === 'clean-and-prune') {
    removeNodeModules()
  }

  runCommand(command, args)
}

main()
