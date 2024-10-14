import { backend } from 'declarations/backend';

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const API_KEY = 'YOUR_GOOGLE_API_KEY';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const familyName = await backend.getFamilyName();
  document.getElementById('family-name').textContent = familyName;

  gapiLoaded();
  gisLoaded();
}

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

async function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    await listUpcomingEvents();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    tokenClient.requestAccessToken({prompt: ''});
  }
}

async function listUpcomingEvents() {
  let response;
  try {
    const request = {
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime',
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }

  const events = response.result.items;
  if (!events || events.length == 0) {
    document.getElementById('content').innerText = 'No events found.';
    return;
  }
  // Flatten to string to display
  const output = events.reduce(
      (str, event) => `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
      'Events:\n');
  document.getElementById('content').innerText = output;
}

async function displayCalendar() {
  const familyMembers = await backend.getFamilyMembers();
  const calendarContainer = document.getElementById('calendar-container');
  
  for (const member of familyMembers) {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member-calendar';
    memberDiv.innerHTML = `<h2>${member}</h2><div id="${member}-events"></div>`;
    calendarContainer.appendChild(memberDiv);
    
    const token = await backend.getAuthToken(member);
    if (token) {
      // Use the token to fetch events for this member
      // This is a placeholder and would need to be implemented
      fetchMemberEvents(member, token);
    }
  }
}

function fetchMemberEvents(member, token) {
  // Placeholder function
  // In a real implementation, you would use the token to authenticate
  // and fetch events for this specific family member
  console.log(`Fetching events for ${member} with token ${token}`);
}

// Call displayCalendar after successful authentication
handleAuthClick().then(displayCalendar);
