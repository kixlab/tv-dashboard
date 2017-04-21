import './style.scss';
import moment from 'moment';

/* List of deadline items */
let items = [
    {title: 'CHI 2018 Full Paper', time: moment('April 21, 2017 2:00 PDT')}
];


/* Templates */
const itemTemplate = (item) => `<li class="deadline-item grid-headline">
    <span class="item-title">${item.title}</span>
    <span class="item-date">${item.time.format('MMM Do YYYY')}</span>
    <span class="item-timeleft">${moment().to(item.time)}</span>
</li>`;
const itemsTemplate = (items) => items.map(itemTemplate).join('');
const currentTimeTemplate = (date) => date.toLocaleString();

/* Shortcut */
const $ = document.querySelectorAll.bind(document);

/* Update routine */
const update = () => {
    $('#current-time')[0].innerHTML = currentTimeTemplate(new Date());
    $('#deadline-list')[0].innerHTML = itemsTemplate(items);
};

/* Sort deadline items */
items.sort((a, b) => a.time.diff(b.time, 'seconds') > 0);

/* Install document.ready event listener */
document.addEventListener("DOMContentLoaded", () => {
  setInterval(update, 1000);
  update();
});