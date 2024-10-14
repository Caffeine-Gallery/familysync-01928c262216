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
    const calendarTabs = document.getElementById('calendar-tabs');
    const calendarContainer = document.getElementById('calendar-container');
    
    calendarTabs.innerHTML = '';
    calendarContainer.innerHTML = '';
    
    familyMembers.forEach((member, index) => {
      const tab = document.createElement('button');
      tab.textContent = member;
      tab.classList.add('calendar-tab');
      if (index === 0) tab.classList.add('active');
      tab.onclick = () => switchTab(member);
      calendarTabs.appendChild(tab);

      const calendar = document.createElement('div');
      calendar.id = `${member}-calendar`;
      calendar.classList.add('member-calendar');
      if (index === 0) calendar.classList.add('active');
      calendarContainer.appendChild(calendar);
    });

    await fetchAndDisplayEvents(familyMembers[0]);
  } catch (error) {
    console.error('Error displaying calendar:', error);
    document.getElementById('calendar-container').innerHTML = '<p>Error loading calendar. Please try again later.</p>';
  }
}

async function switchTab(member) {
  document.querySelectorAll('.calendar-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.member-calendar').forEach(calendar => calendar.classList.remove('active'));
  
  document.querySelector(`button.calendar-tab:nth-child(${Array.from(document.querySelectorAll('.calendar-tab')).findIndex(tab => tab.textContent === member) + 1})`).classList.add('active');
  document.getElementById(`${member}-calendar`).classList.add('active');

  await fetchAndDisplayEvents(member);
}

async function fetchAndDisplayEvents(member) {
  try {
    const events = await backend.getMemberEvents(member);
    displayMemberEvents(member, events);
  } catch (error) {
    console.error(`Error fetching events for ${member}:`, error);
    document.getElementById(`${member}-calendar`).innerHTML = '<p>Error loading events. Please try again later.</p>';
  }
}

function displayMemberEvents(member, events) {
  const calendarDiv = document.getElementById(`${member}-calendar`);
  calendarDiv.innerHTML = '';

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

    calendarDiv.appendChild(dayColumn);
  }
}
