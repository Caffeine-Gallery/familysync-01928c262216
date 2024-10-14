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
    
    calendarContainer.innerHTML = '';
    
    for (const member of familyMembers) {
      const memberColumn = document.createElement('div');
      memberColumn.classList.add('member-column');

      const avatar = document.createElement('img');
      avatar.src = await backend.getMemberAvatar(member);
      avatar.alt = `${member}'s avatar`;
      avatar.classList.add('member-avatar');
      memberColumn.appendChild(avatar);

      const nameElement = document.createElement('h2');
      nameElement.textContent = member;
      nameElement.classList.add('member-name');
      memberColumn.appendChild(nameElement);

      const calendar = document.createElement('div');
      calendar.classList.add('member-calendar');
      memberColumn.appendChild(calendar);

      calendarContainer.appendChild(memberColumn);

      await fetchAndDisplayEvents(member, calendar);
    }
  } catch (error) {
    console.error('Error displaying calendar:', error);
    document.getElementById('calendar-container').innerHTML = '<p>Error loading calendar. Please try again later.</p>';
  }
}

async function fetchAndDisplayEvents(member, calendarElement) {
  try {
    const events = await backend.getMemberEvents(member);
    displayMemberEvents(events, calendarElement);
  } catch (error) {
    console.error(`Error fetching events for ${member}:`, error);
    calendarElement.innerHTML = '<p>Error loading events. Please try again later.</p>';
  }
}

function displayMemberEvents(events, calendarElement) {
  calendarElement.innerHTML = '';

  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    
    const dayColumn = document.createElement('div');
    dayColumn.classList.add('day-column');
    
    const dayHeader = document.createElement('h3');
    dayHeader.textContent = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    dayColumn.appendChild(dayHeader);

    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === day.toDateString();
    });

    dayEvents.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.classList.add('event');
      eventDiv.textContent = `${event.summary} (${new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})`;
      dayColumn.appendChild(eventDiv);
    });

    calendarElement.appendChild(dayColumn);
  }
}
