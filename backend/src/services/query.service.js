import sql from "../database/mariadb.js";
import Query from "../models/Query.js";

const options = {
  limit: {
    inventory: 50,
    server: 5,
    channel: 5,
  },
};

Query.enter = async (req, res, next) => {
  const data = req.body;
  const [readUser] = await sql
    .promise()
    .query(`SHOW TABLE STATUS WHERE name = 'user'`);

  const [createUser] = await sql.promise().query(
    `INSERT INTO user (uuid, email, password, nickname, limit_inventory, deletion)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.uuid,
      "",
      "",
      `guest${readUser[0].Auto_increment || 0}`,
      options.limit.inventory,
      false,
    ]
  );

  /* channel */
  const [readChannel] = await sql
    .promise()
    .query(`SHOW TABLE STATUS WHERE name = 'channel'`);
  const [findChannel] = await sql.promise().query(
    `SELECT channel.id, channel.limits, COUNT(*) AS count
      FROM channel
      LEFT JOIN enter
      ON channel.id = enter.channel_id
      GROUP BY channel.id`
  );
  let isChannelFull = true;
  let channelTarget = null;
  for (let i = 0; i < findChannel.length; i++) {
    let channel = findChannel[i];
    if (channel.count < channel.limits) {
      isChannelFull = false;
      channelTarget = channel.id;
      break;
    }
  }
  if (isChannelFull) {
    await sql.promise().query(
      `INSERT INTO channel (name, limits)
      VALUES (?, ?)`,
      [`channel${readChannel[0].Auto_increment || 0}`, options.limit.channel]
    );
    channelTarget = readChannel[0].Auto_increment || 0;
  }

  /* server */
  const [readServer] = await sql
    .promise()
    .query(`SHOW TABLE STATUS WHERE name = 'server'`);
  const [findServer] = await sql.promise().query(
    `SELECT server.id,
      enter.channel_id,
      server.limits,
      channel.limits AS channel_limits,
      COUNT(enter.channel_id) AS user_count
    FROM enter
    LEFT JOIN server
    ON enter.server_id = server.id
    LEFT JOIN channel
    ON enter.channel_id = channel.id
    GROUP BY enter.server_id, enter.channel_id`
  );
  let isServerFull = true;
  let serverTarget = null;
  for (let i = 0; i < findServer.length; i++) {
    let server = findServer[i];
    console.log(server);
    if (
      server.count < server.limits &&
      server.user_count >= server.channel_limits
    ) {
      isServerFull = false;
      serverTarget = readServer[0].Auto_increment || 0;
      await sql.promise().query(
        `INSERT INTO server (name, limits)
        VALUES (?, ?)`,
        [`server${readServer[0].Auto_increment || 0}`, options.limit.server]
      );
      break;
    }
  }
  if (isServerFull) {
    await sql.promise().query(
      `INSERT INTO server (name, limits)
      VALUES (?, ?)`,
      [`server${readServer[0].Auto_increment || 0}`, options.limit.server]
    );
    serverTarget = readServer[0].Auto_increment || 0;
  }

  await sql.promise().query(
    `INSERT INTO enter (server_id, user_id, channel_id, type, status)
    VALUES (?, ?, ?, ?, ?)`,
    [serverTarget, createUser.insertId, channelTarget, "viewer", 1]
  );

  res.status(200).json({
    ok: true,
    server: serverTarget,
    channel: channelTarget,
    type: "viewer",
    alive: 1,
    socketHost: "",
    socketPort: 4000,
  });
};
Query.login = async (req, res, next) => {
  res.status(200).json({
    ok: true,
  });
};
Query.logout = async (req, res, next) => {
  res.status(200).json({
    ok: true,
  });
};

const queryService = Query;

export default queryService;
