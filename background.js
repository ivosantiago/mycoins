const EXCHANGE = "FOX"; //Foxbit. Change it to map to multiple options.
const ticker = "ticker_1h"; //Change it to 1h, 12h, 24h
let pollIntervalInMin = 1; // 1 minute

function updatePopup(exchangeValues) {
  chrome.runtime.sendMessage({
    msg: "update_exchanges",
    data: {
      FOX: exchangeValues
    }
  });
}

function setPositiveBadge() {
  const ARROW_UP = String.fromCharCode(parseInt("25B2", 16)).trim();

  chrome.browserAction.setBadgeBackgroundColor({ color: [118, 183, 130, 230] });
  chrome.browserAction.setBadgeText({ text: ARROW_UP });
}

function setNegativeBadge() {
  const ARROW_DOWN = String.fromCharCode(parseInt("25BC", 16)).trim();

  chrome.browserAction.setBadgeBackgroundColor({ color: [210, 64, 58, 230] });
  chrome.browserAction.setBadgeText({ text: ARROW_DOWN });
}

function setDefaultBadge() {
  chrome.browserAction.setBadgeBackgroundColor({ color: [60, 60, 60, 230] });
  chrome.browserAction.setBadgeText({ text: "-" });
}

function updateIcon(exchangeValues) {
  !exchangeValues
    ? setDefaultBadge()
    : exchangeValues.last >= exchangeValues.open
      ? setPositiveBadge()
      : setNegativeBadge();

  return exchangeValues;
}

function getTicker() {
  const URL = "https://api.bitvalor.com/v1/ticker.json";
  return fetch(URL)
    .then(response => {
      return response.json();
    })
    .catch(e => {
      console.error("Failed getting the ticker information", e);
      return e;
    });
}

function getDolar(exchangeValues) {
  const URL = "https://economia.awesomeapi.com.br/json/USD-BRL/1";
  return fetch(URL)
    .then(response => {
      console.log(response);
      return exchangeValues;
    })
    .catch(e => {
      console.error("Failed getting the dolar information", e);
      return e;
    });
}

function calculateRatios(exchangeValues) {
  return exchangeValues;
}

function scheduleAlarm() {
  console.warn(`Scheduling refresh for ${pollIntervalInMin} minute(s)`);
  chrome.alarms.create("refresh", { periodInMinutes: pollIntervalInMin });
}

function selectExchange(data) {
  return data[ticker].exchanges[EXCHANGE];
}

function startRequest({ shouldScheduleAlarm }) {
  // Schedule request immediately. We want to be sure to reschedule, even in the
  // case where the extension process shuts down while this request is
  // outstanding.
  if (shouldScheduleAlarm) scheduleAlarm();

  getTicker()
    .then(selectExchange)
    // .then(getDolar)
    .then(updateIcon)
    // .then(updatePopup)
    .catch(console.log);
}

////////////////////////////////////////////
//              Startup code              //
////////////////////////////////////////////
chrome.alarms.onAlarm.addListener(() => {
  // Should we reschedule if something fail?
  // startRequest({ shouldScheduleAlarm: true });
  startRequest({ shouldScheduleAlarm: false });
});

chrome.runtime.onInstalled.addListener(() => {
  startRequest({ shouldScheduleAlarm: true });
});

chrome.runtime.onStartup.addListener(() => {
  startRequest({ shouldScheduleAlarm: true });
});
