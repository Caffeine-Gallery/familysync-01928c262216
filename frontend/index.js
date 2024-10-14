import { AuthClient } from "@dfinity/auth-client";
import { backend } from 'declarations/backend';

let authClient;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const familyName = await backend.getFamilyName();
  document.getElementById('family-name').textContent = familyName;

  authClient = await AuthClient.create();
  if (await authClient.isAuthenticated()) {
    handleAuthenticated();
  } else {
    document.getElementById('auth-button').onclick = login;
  }
}

async function login() {
  await authClient.login({
    identityProvider: "https://identity.ic0.app/#authorize",
    onSuccess: handleAuthenticated,
  });
}

async function handleAuthenticated() {
  document.getElementById('auth-button').style.display = 'none';
  await displayCalendar();
}

async function displayCalendar() {
  try {
    const familyMembers = await backend.getFamilyMembers();
    const calendarContainer = document.getElementById('calendar-container');
    calendarContainer.innerHTML = ''; // Clear previous content
    
    for (const member of familyMembers) {
      const memberDiv = document.createElement('div');
      memberDiv.className = 'member-calendar';
      memberDiv.innerHTML = `<h2>${member}</h2><div id="${member}-events"></div>`;
      calendarContainer.appendChild(memberDiv);
      
      const events = await fetchMemberEvents(member);
      displayMemberEvents(member, events);
    }
  } catch (error) {
    console.error('Error displaying calendar:', error);
    // Display error message to user
    document.getElementById('calendar-container').innerHTML = '<p>Error loading calendar. Please try again later.</p>';
  }
}

async function fetchMemberEvents(member) {
  try {
    // This is a placeholder. In a real implementation, you would fetch events from your backend
    // which would in turn fetch from Google Calendar or store events itself.
    const response = await backend.getMemberEvents(member);
    return response;
  } catch (error) {
    console.error(`Error fetching events for ${member}:`, error);
    return [];
  }
}

function displayMemberEvents(member, events) {
  const eventContainer = document.getElementById(`${member}-events`);
  if (events.length === 0) {
    eventContainer.innerHTML = '<p>No events scheduled.</p>';
  } else {
    const eventList = events.map(event => `<li>${event.summary} (${event.start})</li>`).join('');
    eventContainer.innerHTML = `<ul>${eventList}</ul>`;
  }
}
