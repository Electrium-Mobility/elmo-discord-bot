module.exports = {
    apps: [
        {
            name: "discord-bot",
            script: "npm",
            args: "start",
            cwd: "/elmo-discord-bot",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "production",
            },
            exec_mode: "series", // Ensure commands run in sequence
            exec_interpreter: "none", // Use the system's default interpreter
            // Set the sequence of commands
            script: "./deploy-commands.sh",
        },
        {
            name: "webhook-listener",
            script: "server.js",
            cwd: "/elmo-discord-bot/server",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "200M",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
