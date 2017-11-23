import './style.scss';
import moment from 'moment';
import './github-stats';
import Tabletop from 'tabletop';

let sheet_key = 'https://docs.google.com/spreadsheets/d/18F5HTC08h-4p-YtHulmSld2BUZ9rr_KJq-xuR3Cu3lI/edit?usp=sharing';

let itemsParsed = [];
let members_by_github_id = [];
let members_by_slack_id = [];

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
const member_display = (member) => {
    if (members_by_slack_id[member]) {
        return members_by_slack_id[member];
    }
    if (members_by_github_id[member]) {
        return members_by_github_id[member];
    }
    return member;
};
const itemTemplate = (item) => `<li class="deadline-item">
    <span class="item-head">
        <span class="item-title">${item.title}</span>
        <span class="item-date">${item.time.format('MMM Do YYYY')}</span>
        <span class="item-timeleft">${timeDiffFormat(item.time)}</span>
    </span>
    <span class="item-members">
        ${item.members.map(member_display).join(", ")}
    </span>
</li>`;
const itemsTemplate = (items) => items.map(itemTemplate).join('');
const currentTimeTemplate = (date) => date.toLocaleString();

/* Shortcut */
const $ = document.querySelectorAll.bind(document);

/* Update routine */
const update = () => {
    $('#current-time')[0].innerHTML = currentTimeTemplate(new Date());
    if (itemsParsed.length) {
        $('#deadline-list')[0].innerHTML = itemsTemplate(itemsParsed);
    }
};

/* Load data */
const load = async () => {
    $('#deadline-list')[0].innerHTML = '<li>Loading...</li>';
    Tabletop.init( { key: sheet_key,
        callback: function(data, tabletop) { 
            let deadlines = tabletop.sheets("Deadlines").all();
            let members = tabletop.sheets("Members").all();

            members_by_github_id = members.reduce((o, m) => ({ ...o, [m.github_id]: m.display_name}), {});
            members_by_slack_id = members.reduce((o, m) => ({ ...o, [m.slack_id]: m.display_name}), {});

            let repos = tabletop.sheets("GitHub").all();
            /* Parse and sort items */
            itemsParsed = deadlines.map((item) => {
                item.time = moment(item['Date']);
                item.title = item['Name'];
                let member_keys = Object.keys(item).filter(key => key.match(/^Member/));
                item.members = member_keys.map(key => item[key]).filter(member => member.length);
                return item;
            })
            itemsParsed.sort((a, b) => a.time.diff(b.time, 'seconds') > 0);
            update();
        },
        simpleSheet: true }
    );
};

/* Install document.ready event listener */
document.addEventListener("DOMContentLoaded", () => {
    // reload data every 10 minutes
    setInterval(load, 1000*60*10);
    load();

    setInterval(update, 1000);
    update();
});
