const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const {exec} = require('child_process')
const yargs = require('yargs')

yargs
  .usage('yarn link [options]')
  .command({
    command: '*',
    builder: yargs =>
      yargs.options({
        packagePath: {
          alias: ['package'],
          description: 'Path to the target package',
          type: 'string',
        },
        packagesPath: {
          alias: ['root'],
          description: 'Path to the root directory of the local packages',
          type: 'string',
        },
        runInstall: {
          alias: ['install'],
          description: 'Run `yarn install` before link package',
          type: 'boolean',
          default: false,
        },
        runBuild: {
          alias: ['build'],
          description: 'Run `yarn build` if needed before link package',
          type: 'boolean',
          default: true,
        },
        include: {
          description: 'Package names to link',
          type: 'array',
        },
        exclude: {
          description: 'Package names to not link',
          type: 'array',
        },
        unlink: {
          description: 'Unlink packages instead of linking them',
          type: 'boolean',
          default: false,
        },
      }),
    handler: async args => {
      try {
        if (args.unlink) await unlink(args)
        else await link(args)
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    },
  })
  .help().argv

async function link({
  include,
  exclude = [],
  packagePath = process.cwd(),
  packagesPath = path.resolve(packagePath, '..'),
  runInstall = false,
  runBuild = true,
} = {}) {
  const target = await getPackage(packagePath)
  if (!target) process.exit(1)

  const packages = await getPackages(packagesPath, {include, exclude})

  const results = await task(target, packages)

  results.forEach(result => {
    if (result.error) {
      console.error(chalk.redBright(`${chalk.bold.yellow(result.name)} wasn't linked due to error`))
      console.error(result.error)
      process.exit(1)
    }
    console.log(chalk.greenBright(`${chalk.bold.cyan(result.name)} was successfully linked`))
  })

  async function task(target, packages) {
    const dependencies = target.dependencies
      .filter(dependencyName => packages.has(dependencyName))
      .map(dependencyName => packages.get(dependencyName))

    return dependencies.reduce(async (promise, dependency) => {
      const chunk = await new Promise(resolve => {
        const commands = [`yarn link`]
        if (runInstall) commands.push(`yarn install`)
        if (runBuild && dependency.hasBuild) commands.push(`yarn build`)
        commands.push(`cd ${target.path}`, `yarn link ${dependency.name}`)
        exec(commands.join(' && '), {cwd: dependency.path}, async error => {
          const results = !error ? await task(dependency, packages) : []
          resolve([{target, dependency, error}, ...results])
        })
      })
      const results = await promise
      return results.concat(chunk)
    }, Promise.resolve([]))
  }
}

async function unlink({
  include,
  exclude = [],
  packagePath = process.cwd(),
  packagesPath = path.resolve(packagePath, '..'),
} = {}) {
  const target = await getPackage(packagePath)
  if (!target) process.exit(1)

  const packages = await getPackages(packagesPath, [include, exclude])

  const dependencies = target.dependencies
    .filter(dependencyName => packages.has(dependencyName))
    .map(dependencyName => packages.get(dependencyName))

  const result = await new Promise(resolve => {
    const commands = [`yarn unlink ${dependencies.map(dependency => dependency.name).join(' ')}`]
    exec(commands.join(' && '), {cwd: packagePath}, error => resolve({error}))
  })

  if (result.error) {
    console.error(chalk.redBright('Something went wrong'))
    console.error(result.error)
    process.exit(1)
  }

  console.log(chalk.greenBright('All local dependencies are successfully unlinked'))
}

async function isFile(filePath) {
  return new Promise(resolve => {
    fs.stat(filePath, (err, stats) => resolve(!err ? stats.isFile() : false))
  })
}

async function getManifest(packagePath) {
  const manifestPath = path.resolve(packagePath, './package.json')
  if (!(await isFile(manifestPath))) return null
  return require(manifestPath)
}

async function getPackage(packagePath) {
  const manifest = await getManifest(packagePath)
  if (!manifest) return null
  return {
    name: manifest.name,
    alias: path.dirname(packagePath),
    path: packagePath,
    dependencies: Object.keys({
      ...manifest.dependencies,
      ...manifest.devDependencies,
      ...manifest.optionalDependencies,
    }),
    hasBuild: Boolean(manifest.scripts && manifest.scripts.build),
  }
}

async function getPackages(packagesPath, {include, exclude = []} = {}) {
  const entries = await new Promise(resolve => {
    fs.readdir(packagesPath, (err, entries) => resolve(!err ? entries : []))
  })
  return entries.reduce(async (promise, entry) => {
    const data = await getPackage(path.resolve(packagesPath, entry))
    const packages = await promise

    if (
      !data ||
      exclude.some(name => name === data.name || name === data.alias) ||
      (include && include.every(name => name !== data.name && name !== data.alias))
    ) {
      return packages
    }

    packages.set(data.name, data)
    return packages
  }, Promise.resolve(new Map()))
}
