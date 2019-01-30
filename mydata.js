/**
 * Created by Robert on 31/01/2019.
 */

// todo
// design useful filters
// check out table sorting, any libraries I may want to use
// HTML mock up filters, then implement js

window.addEventListener('DOMContentLoaded', init);

/***********************************************************************************************************************
        GLOBALS and CONSTANTS
***********************************************************************************************************************/
var tags = ['a', 'b', 'c'];

var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1ht99t3Ok4m9FB42giTvz3qSi9nZGq1jYMpKaS4DvDEg/edit?usp=sharing';
var ID_TABLE = 'table0';
var ID_FILTERS = 'filters';

var $FiltersBody = $('#'+ID_FILTERS).find('div.card').find('div.card-body');

/***********************************************************************************************************************
        FUNCTIONS
***********************************************************************************************************************/

function init() {

    createTableHeaders(ID_TABLE, ['Name', 'Value', 'Unit']);

    Tabletop.init({
        key: publicSpreadsheetUrl,
        callback: showInfo,
        simpleSheet: true
    });

    createTags();
}

function showInfo(data, tabletop) {
    console.log(data);

    for (var i in data) {
        var row = data[i];
        row.number = parseFloat(row.value) * Math.pow(10, parseFloat(row.mag));
        createTableRow(null, ID_TABLE, [
            row.name,
            row.number,
            row.unit
        ]);
    }
}

function createTags() {
    var html = [
        '<div class="checkbox">',
        '<label><input type="checkbox" value=""><span class="label label-default">Earth</span></label>',
        '</div>',
        '<div class="checkbox">',
        '<label><input type="checkbox" value=""><span class="label label-info">Astronomy</span></label>',
        '</div>'
    ].join('');
    $FiltersBody.append($(html))
}

function createTableHeaders(id, headers) {
    // get header row for given table, and create the headers in it
    // should only be called once
    var $id = $('#'+id);
    $id.find('thead').append($('<tr>'));
    var headerRow = $id.find('thead').find('tr').last();
    for (var i in headers) {
        headerRow.append($('<th>')
            .text(headers[i])
        );
    }
}

function createTableRow(id, parent, data) {
    // create a new row in the given parent table, optionally with an id
    var $parent = $('#'+parent);
    if (id == null) {
        $parent.find('tbody').append($('<tr>'));
    } else {
        $parent.find('tbody').append($('<tr id="'+id+'">'));
    }
    var row = $parent.find('tbody').find('tr').last();
    for (var i in data) {
        row.append($('<td>')
            .append(data[i])
        );
    }
}