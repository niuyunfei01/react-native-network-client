/**
 * 操作全局 global 的方法集合在这里，其他地方只能读取，不能修改
 */

global.hostPort = '';

/**
 *
 * @param hostPort  Host[:Port] without tail '/' and head '//'
 */
function setHostPort(hostPort) {
  if (!hostPort) {
    console.log(`skip setting global variable 'hostPort' to be ${hostPort}`);
    return;
  }
  console.log(`set global variable 'hostPort' to be ${hostPort}`);
  global.hostPort = hostPort;
}

/**
 * 启动时调用此方法更新全局host设置
 *
 * TODO: 以后需要将是否使用与发布的设置放在 RN 里，则可直接修改全局 global。
 * @param global global reducer
 * @param native
 * @param callback execute when done getting from native
 */
export async function setHostPortNoDef(global, native, callback) {
  if (global.host) {
    setHostPort(global.host);
  }
  native.host((host) => {
    if (host) {
      setHostPort(host);
      callback();
    }
  });
}