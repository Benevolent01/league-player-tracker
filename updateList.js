const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
let apiKey = process.env.RIOT_API_KEY;
const { log } = require("console");
const fs = require("fs");

const HEADERS_RIOT_TOKEN = "X-Riot-Token";
const EUW_SERVER = "euw1";
const EUNE_SERVER = "eun1";

/*
 */

function getObj(data, prevName) {
  return { accountInfo: { ...data }, previousNames: prevName || [] };
}

async function fetchData(url, headers) {
  try {
    const r = await fetch(url, { headers });
    return await r.json();
  } catch (e) {
    console.log(`API request failed, ${e.message}`);
  }
}

async function getLeagueByPuuid(puuid, server) {
  let headers = { [HEADERS_RIOT_TOKEN]: apiKey };
  let url = `https://${getCorrectServer(server)}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return fetchData(url, headers);
}

async function getLeagueByName(summonerName, server) {
  let headers = { [HEADERS_RIOT_TOKEN]: apiKey };
  let url = `https://${getCorrectServer(server)}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(summonerName)}`;
  return fetchData(url, headers);
}

function getCorrectServer(server) {
  return server[2].toLowerCase() === "w" ? EUW_SERVER : EUNE_SERVER;
}

async function updateList(file, list, server) {
  // Create the file json/txt
  if (!fs.existsSync(`${file}.txt`)) {
    fs.writeFileSync(`${file}.txt`, JSON.stringify([]));
  }

  // If the buffer has nothing, pass it an empty array, and parse it
  let buffer = fs.readFileSync(`${file}.txt`, "utf-8") || "[]";
  let array = [];
  array = JSON.parse(buffer);

  let newArray = [];
  let inQueue = new Map([]);
  let written = new Map([]);

  // Don't confuse lower-case, upper-case entries
  array.forEach((x) => (x.accountInfo.name = x.accountInfo.name.toLowerCase()));
  list = list.map((name) => name.toLowerCase());

  // Already written values are expected to have accountInfo.puuid etc
  for (let items of array) {
    let puuid = items.accountInfo.puuid,
      z_name = items.accountInfo.name;
    if (inQueue.has(puuid) || inQueue.has(z_name)) continue;
    array.push(getObj(items.accountInfo, items.previousNames));
    inQueue.set(puuid, 1);
    inQueue.set(z_name, 1);
  }

  for (let some_name of list) {
    // Remove possible duplicates
    if (inQueue.has(some_name)) continue;
    let newObj = getObj();
    newObj.accountInfo.name = some_name;
    array.push(newObj);
    inQueue.set(some_name, 1);
  }

  let correctServer = getCorrectServer(server);

  for (let i = 0; i < array.length; i++) {
    let { puuid, name, ...rest } = array[i].accountInfo;

    // Remove possible duplicates
    if (written.has(puuid) || written.has(name)) continue;

    // New entry in the .txt
    let res, newPuuid, newName;
    if (puuid == undefined && name != undefined) {
      try {
        res = await getLeagueByName(name, correctServer);
        if (res.name === undefined) {
          log(`A player with name (${name}) doesn't exist! Moving on..`);
          continue;
        }
      } catch (e) {
        log(`An error occured ${e}`);
      }
      newPuuid = res.puuid;
      // here newName === name
      newName = res.name;
      written.set(name, 1);
      written.set(newPuuid, 1);
      newArray.push(getObj(res));
      log(`I just wrote a freshie (${newName})!`);
      continue;
    }

    // Entry was in the queue, either update, or rewrite
    try {
      res = await getLeagueByPuuid(puuid, correctServer);
      if (res.puuid === undefined) {
        log(`A player with name (${name}) doesn't exist! Moving on..`);
        continue;
      }
    } catch (e) {
      log(`An error occured ${e}`);
    }

    // Nothing changed
    if (name === res.name.toLowerCase()) {
      newArray.push(getObj(res, array[i].previousNames));
      written.set(name, 1);
      written.set(puuid, 1);
      log(
        `Dummy didn't change name, get back there (${res.name}), they are ${
          res.summonerLevel - array[i].accountInfo.summonerLevel
        } levels up since the last time!`
      );
      continue;
    }

    // Update name
    (newPuuid = res.puuid), (newName = res.name);
    let newObj = getObj(res, array[i].previousNames);
    newObj.previousNames.push(name);
    written.set(name.toLowerCase(), 1);
    written.set(newPuuid, 1);
    newArray.push(newObj);
    log(`Dummy ${name} changed its name to ${newName}, updated!`);
  }

  fs.writeFileSync(`${file}.txt`, JSON.stringify(newArray, null, 2));
}

module.exports = updateList;
