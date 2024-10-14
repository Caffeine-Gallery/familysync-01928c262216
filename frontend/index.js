import { AuthClient } from "@dfinity/auth-client";
import { backend } from 'declarations/backend';

let authClient;
let currentView = 'week';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const familyName = await backend.getFamilyName();
  document.getElementById('family-name').textContent = familyName;

  authClient = await AuthClient.create();
  const authButton = document.getElementById('auth-button');
  authButton.onclick = login;

  if (await authClient.isAuthenticated()) {
    handleAuthenticated();
  } else {
    authButton.style.display = 'block';
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

      const viewSelector = document.createElement('div');
      viewSelector.classList.add('view-selector');
      ['day', 'week', 'month'].forEach(view => {
        const button = document.createElement('button');
        button.textContent = view.charAt(0).toUpperCase() + view.slice(1);
        button.onclick = () => changeView(view, member);
        viewSelector.appendChild(button);
      });
      memberColumn.appendChild(viewSelector);

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
    const events = await backend.getMemberEvents(member, currentView);
    displayMemberEvents(events, calendarElement);
  } catch (error) {
    console.error(`Error fetching events for ${member}:`, error);
    calendarElement.innerHTML = '<p>Error loading events. Please try again later.</p>';
  }
}

function displayMemberEvents(events, calendarElement) {
  calendarElement.innerHTML = '';

  const today = new Date();
  let startDate, endDate;

  switch (currentView) {
    case 'day':
      startDate = today;
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(today.setDate(today.getDate() - today.getDay()));
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
  }

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayColumn = document.createElement('div');
    dayColumn.classList.add('day-column');
    
    const dayHeader = document.createElement('h3');
    dayHeader.textContent = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    dayColumn.appendChild(dayHeader);

    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
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

function changeView(view, member) {
  currentView = view;
  const calendarElement = document.querySelector(`#calendar-container .member-column:nth-child(${Array.from(document.querySelectorAll('#calendar-container .member-column')).findIndex(col => col.querySelector('.member-name').textContent === member) + 1}) .member-calendar`);
  fetchAndDisplayEvents(member, calendarElement);
}
