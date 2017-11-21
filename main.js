import './style.scss';
import moment from 'moment';
import items from 'events'
import './github-stats';

/* Parse and sort items */
let itemsParsed = items.map((item) => {
    item.time = moment(item.time);
    return item;
})
itemsParsed.sort((a, b) => a.time.diff(b.time, 'seconds') > 0);


/* Templates */
const timeDiffFormat = (a) => {
    let now = moment();
    let d = a.diff(now, 'days');
    let h = a.diff(now, 'hours') - d*24;
    let m = a.diff(now, 'minutes') - h*60 - d*24*60;
    let str = `${d} days, ${h} hours`;
    if (d < 1) str = `${h} hours, ${m} minutes`;
    return str;
};
const itemTemplate = (item) => `<li class="deadline-item grid-headline">
    <span class="item-title">${item.title}</span>
    <span class="item-date">${item.time.format('MMM Do YYYY')}</span>
    <span class="item-timeleft">${timeDiffFormat(item.time)}</span>
</li>`;
const itemsTemplate = (items) => items.map(itemTemplate).join('');
const currentTimeTemplate = (date) => date.toLocaleString();

/* Shortcut */
const $ = document.querySelectorAll.bind(document);

/* Update routine */
const update = () => {
    $('#current-time')[0].innerHTML = currentTimeTemplate(new Date());
    $('#deadline-list')[0].innerHTML = itemsTemplate(itemsParsed);
};

/* Install document.ready event listener */
document.addEventListener("DOMContentLoaded", () => {
  setInterval(update, 1000);
  update();
});
