(function () {

function getHomeWorks(host) {
    var dfd = $.Deferred();
    
    $.get(host).done(function (html) {
        var homeworks = $(html).find('.js-repo-list').find('h3 a')
        .map(function () {
            return $(this).text();
        })
        .get()
        .filter(function (item) {
            return (/^dz-/).test(item);
        })
        .sort();
        
        dfd.resolve(homeworks);
    });
    
    return dfd.promise();
}

function getPullRequests(repo) {
    var dfd = $.Deferred();
    
    $.get('/cripi-javascript/' + repo + '/pulls')
    .done(function (html) {
        var pulls = $(html).find('.pulls-list').find('.gravatar')
        .map(function () {
            return $(this).attr('href').replace('/', '');
        })
        .get();
        
        dfd.resolve({
            repo: repo,
            pulls: pulls
        });
    });
    
    return dfd.promise();
}

function printResultsTable(results) {
    var headers = ['name'],
        table = [],
        index = {};
    
    results.forEach(function (task) {
        headers.push(task.repo);
        
        task.pulls.forEach(function (student) {
            if (!index[student]) {
                index[student] = {};
                index[student].name = student;
                table.push(index[student]);
            }
            index[student][task.repo] = 1;
        });
    });
    
    console.table(table, headers);
}

getHomeWorks('/cripi-javascript').then(function (homeworks) {
    var promises = homeworks.map(function (homework) {
        return getPullRequests(homework);
    });
    
    $.when.apply($, promises).then(function () {
        printResultsTable([].slice.call(arguments));
    });
});

}());