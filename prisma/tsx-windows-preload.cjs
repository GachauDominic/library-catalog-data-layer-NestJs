const os = require("node:os");

if (process.platform === "win32") {
  const userInfo = os.userInfo.bind(os);

  os.userInfo = (...args) => {
    try {
      return userInfo(...args);
    } catch (error) {
      if (error?.syscall !== "uv_os_get_passwd") throw error;

      return {
        uid: -1,
        gid: -1,
        username: process.env.USERNAME || "windows-user",
        homedir: os.homedir(),
        shell: null,
      };
    }
  };
}
