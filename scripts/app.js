'use strict';

let habits = [];
const HABIT_KEY = 'HABIT_KEY';
let globalActiveHabitId;

//page

const page = {
  menu: document.querySelector('.menu__list'),
  header: {
    h1: document.querySelector('.h1'),
    progressPercent: document.querySelector('.progress__percents'),
    progressCoverBar: document.querySelector('.progress__cover-bar'),
  },
  content: {
    daysContainer: document.getElementById('days'),
    nextDay: document.querySelector('.habbit__day'),
  },
  popup: {
    index: document.getElementById('add-habit-popup'),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
  },
};

//utils

function loadData() {
  const habitString = localStorage.getItem(HABIT_KEY);
  const habitArray = JSON.parse(habitString);
  if (Array.isArray(habitArray)) {
    habits = habitArray;
  }
}

function saveData() {
  localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

function togglePopup() {
  if (page.popup.index.classList.contains('cover-hidden')) {
    page.popup.index.classList.remove('cover-hidden');
  } else {
    page.popup.index.classList.add('cover-hidden');
  }
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = '';
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove('error');
    if (!fieldValue) {
      form[field].classList.add('error');
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) isValid = false;
  }
  if (!isValid) return;
  return res;
}

//render
function renderedMenu(activeHabit) {
  for (const habit of habits) {
    const existed = document.querySelector(`[menu-habit-id="${habit.id}"]`);
    if (!existed) {
      const element = document.createElement('button');
      element.setAttribute('menu-habit-id', habit.id);
      element.classList.add('menu__item');
      element.addEventListener('click', () => rendered(habit.id));
      element.innerHTML = `<img src="/images/${habit.icon}.svg" alt="${habit.name}" />`;
      if (activeHabit.id === habit.id) {
        element.classList.add('menu__item_active');
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabit.id === habit.id) {
      existed.classList.add('menu__item_active');
    } else {
      existed.classList.remove('menu__item_active');
    }
  }
}

function renderedHead(activeHabit) {
  page.header.h1.innerText = activeHabit.name;
  const progress =
    activeHabit.days.length / activeHabit.target > 1
      ? 100
      : (activeHabit.days.length / activeHabit.target) * 100;
  page.header.progressPercent.innerText = `${progress.toFixed(0)}%`;
  page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function renderContent(activeHabit) {
  page.content.daysContainer.innerHTML = '';
  for (const index in activeHabit.days) {
    const element = document.createElement('div');
    element.classList.add('habbit');
    element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
              <div class="habbit_comment">${activeHabit.days[index].comment}</div>
              <button class="habbit__delete" onclick='deleteDay(${index})'>
                <img src="/images/delete.svg" alt="Удалить день ${index + 1}" />
              </button>`;
    page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerHTML = `День ${activeHabit.days.length + 1}`;
}

function rendered(activeHabitId) {
  globalActiveHabitId = activeHabitId;
  const activeHabit = habits.find((habit) => habit.id === activeHabitId);
  if (!activeHabit) return;
  document.location.replace(document.location.pathname + '#' + activeHabitId);
  renderedMenu(activeHabit);
  renderedHead(activeHabit);
  renderContent(activeHabit);
}

// work with days

function addDays(e) {
  const form = e.target;
  e.preventDefault();

  const data = validateAndGetFormData(form, ['comment']);
  if (!data) {
    return;
  }
  habits = habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      return {
        ...habit,
        days: habit.days.concat([{ comment: data.comment }]),
      };
    }
    return habit;
  });

  resetForm(form, ['comment']);
  rendered(globalActiveHabitId);
  saveData();
}

function deleteDay(index) {
  habits = habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      habit.days.splice(index, 1);
      return {
        ...habit,
        days: habit.days,
      };
    }
    return habit;
  });
  rendered(globalActiveHabitId);
  saveData();
}

// working with habits

function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector('.icon.icon_active');
  activeIcon.classList.remove('icon_active');
  context.classList.add('icon_active');
}

function addHabit(e) {
  const form = e.target;
  e.preventDefault();

  const data = validateAndGetFormData(form, ['name', 'icon', 'target']);
  if (!data) {
    return;
  }
  const maxId = habits.reduce((acc, habits) => (acc > habits.id ? acc : habits.id), 0);
  habits.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  });
  resetForm(form, ['name', 'target']);
  togglePopup();
  saveData();
  rendered(maxId + 1);
}

// init
(() => {
  loadData();
  const hashId = Number(document.location.hash.replace('#', ''));
  const urlHabit = habits.find((habit) => habit.id == hashId);
  if (urlHabit) {
    rendered(urlHabit.id);
  } else {
    rendered(habits[0].id);
  }
})();
