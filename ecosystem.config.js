module.exports = {
  apps: [
    {
      name: "form-back",
      cwd: "/home/distrolacTienda/server",
      script: "src/index.js",        // <<--- acá el entry correcto
      env: {
        NODE_ENV: "production",
        PORT: 4100
      }
    }
  ]
};

