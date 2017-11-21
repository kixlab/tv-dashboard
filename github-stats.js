
import moment from 'moment';

var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

const request = function(url) {
    let token = urlParams['token'];
    let request_options = {
        headers: new Headers({
            'Authorization': 'token ' + token
        })
    };
    return new Request(url, request_options);
}

const fetch_json = function(url) {
    return fetch(request(url)).then(
        resp => {
            if (resp.status == 204) return {};
            else return resp.json();
        }
    );
};

const load = async function(){
    // Check rate limiting
    let rate_limit = await fetch_json('https://api.github.com/rate_limit');
    if (rate_limit.rate.remaining == 0) {
        console.error('Github API rate limiting in effect. Wait for reset at ' + moment(1000*rate_limit.rate.reset).toLocaleString());
        return;
    } else {
        console.info('Github API rate limiting: ' + rate_limit.rate.remaining + ' requests remaining.');
    }
    // Get list of repos
    let repos = await fetch_json('https://api.github.com/orgs/kixlab/repos');
    repos.sort((a, b) => -(moment(a.pushed_at) - moment(b.pushed_at)));
    //repos = repos.slice(0, 5);
    // Load contributors and statistics simultaneously
    let fetches = [];
    fetches.push(...repos.map(repo =>
        fetch_json('https://api.github.com/repos/kixlab/' + repo.name + '/stats/contributors').then(data => {
            repo.contributors = data;
        })
    ));
    fetches.push(...repos.map(repo => 
        fetch_json('https://api.github.com/repos/kixlab/' + repo.name + '/stats/commit_activity').then(data => {
            repo.commit_activity = data;
        })
    ));
    await Promise.all(fetches);
    // Display data
    for (let repo of repos) {
        console.log(repo.name, repo.pushed_at, repo.contributors, repo.commit_activity);
        if (repo.contributors) {
            for (let i in repo.contributors) {
                let contributor = repo.contributors[i];
                console.log(contributor.author.login, contributor.total, contributor.author.avatar_url);
            }
        }
        if (repo.commit_activity) {
            let title = repo.name + " (last push " + moment(repo.pushed_at).fromNow() + ")";
            draw_commit_activity_chart(title, repo.commit_activity);
        }
    }
};

const draw_commit_activity_chart = function(name, commit_activity) {
    google.charts.load('current', {'packages': ['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var node = document.createElement("div");
        node.id = 'chart_' + name;
        

        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Week');
        data.addColumn('number', 'Number of commits');
  
        let array = [];
        let total = 0;
        for (let i in commit_activity) {
            let week = commit_activity[i];
            array.push([moment(week.week*1000)._d, week.total]);
            total += week.total;
        }
        if (total == 0) return;
        let months = 12;
        if (commit_activity.length > 1) {
            months = moment.duration(1000*(commit_activity[commit_activity.length-1].week - commit_activity[0].week)).asMonths();
        }
        console.log(array);
        data.addRows(array);
    
        var options = {
            title: name,
            curveType: 'function',
            legend: 'none',
            width: 450,
            height: 200,
            hAxis: {
                format: 'M.yyyy',
                gridlines: {count: Math.ceil(months/2)}
            },
            vAxis: {
                gridlines: {color: 'none'},
                minValue: 0,
                viewWindow: {
                    min: 0
                }
            }
        };

        document.getElementById('charts').appendChild(node);
        var chart = new google.visualization.LineChart(node);
        chart.draw(data, options);
        
    }
};


document.addEventListener("DOMContentLoaded", () => {
    setInterval(load, 30*60000);
    load();
});
/*

contributors
*/