module.exports = {
  apps: [
    {
      name: "app1",
      script: "./app.js",
      node_args: "-r esm",
      watch: true,
      exec_mode: "cluster",
      instances: 2,
      wait_ready: true,
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
