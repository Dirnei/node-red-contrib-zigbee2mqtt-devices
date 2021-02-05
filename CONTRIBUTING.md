# Contributing

Everyone is welcomed to create a pull request. If you are unsure what or how to do something, we can discuss it on [GitHub](https://github.com/Dirnei/node-red-contrib-zigbee2mqtt-devices) or [Discord](https://discord.gg/4qCMEhJ).


# Development Environment

The project is written in JavaScript, HTML, and Typescript. We are currently in the process of migrating towards Typescript for new nodes.

For easier development, we have a couple of npm tasks:

`npm run build` calls the typescript compiler and copies the HTML and JavaScript files to the `dist/` folder.

`npm run builddocker` runs the build task and launches the project within a Node-RED docker container.
In VS-Code you can also press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> to run this task

`npm run lint` calls eslint.

`npm run createnode` to create a new JavaScript node. There is no template for a Typescript node yet.

# System requirements
Developing is possible on Windows, Linux, and macOS. The IDE is up to you; we use VS-Code.

- **Node.js & NPM** - One of the [LTS releases](https://nodejs.org/en/about/releases/)
- **Docker & Docker Compose** - It's the easiest way to run the nodes with `npm run builddocker`
- **Powershell**. On Windows, it is preinstalled. On Linux and macOS, you have to [install](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell?view=powershell-7.1) it.
- **rsync** - only required on Linux and macOS.