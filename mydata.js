/**
 * Created by Robert on 31/01/2019.
 */

// todo
// design useful filters
// check out table sorting, any libraries I may want to use
// HTML mock up filters, then implement js
// may need https://mdbootstrap.com/

window.addEventListener('DOMContentLoaded', init);

/***********************************************************************************************************************
        GLOBALS and CONSTANTS
***********************************************************************************************************************/
var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1ht99t3Ok4m9FB42giTvz3qSi9nZGq1jYMpKaS4DvDEg/edit?usp=sharing';
var ID_TABLE = 'table0'; // main table
var ID_FILTERS = 'filters';
var ID_TAGS = 'tags'; // where to create tags checkbox filters

var DATA = null; // global for data, assigned in showInfo once read in
var TABLETOP = null; // tabletop object for data, assigned in showInfo once read in
var TAGS = []; // populated after data read in
var UNITS = {
    length : ['m', 'km', 'ft'],
    mass : ['kg'],
    speed : ['m/s', 'kph', 'km/h']
};


//var $FiltersBody = $('#'+ID_FILTERS).find('div.card').find('div.card-body');

/***********************************************************************************************************************
        MATHS FUNCTIONS
***********************************************************************************************************************/
function roundToSigFig(num, n) {
    return Number(num.toPrecision(n))
}
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
    // DON'T PUT ANYTHING HERE THAT NEEDS THE TABLE TO HAVE BEEN READ IN
}

function showInfo(data, tabletop) {
    DATA = data;
    TABLETOP = tabletop;

    // process data in good format
    for (var i in data) {
        var row = data[i];
        row.number = parseFloat(row.value) * Math.pow(10, parseFloat(row.mag));
        addToTags(readTags(row.tags));
    }
    // create table rows
    for (i=0; i<data.length; i++) {
        row = data[i];
        createTableRow(null, ID_TABLE, [
            row.name,
            row.number,
            row.unit
        ]);
        if (i < data.length - 1) {
            createTableDiffRow(ID_TABLE, [
                '',
                'x' + roundToSigFig(
                    data[i+1].number / data[i].number,
                    2
                )*100 + '%',
                ''
            ]);
        }
    }

    createTags();
}

function readTags(tags) {
    // tags a string of comma separate tags and converts to a list
    tags = tags.split(',');
    for (var i in tags) {
        tags[i] = capitalise(tags[i]);
    }
    return tags;
}

function capitalise(text) {
    // replace beginning of word with capital
    return text.replace(/\b\w/g, function(l){ return l.toUpperCase()});
}

function addToTags(newTags) {
    //console.log('newtags', newTags, typeof(newTags));
    for (var i in newTags) {
        if (TAGS.indexOf(newTags[i]) == -1) {
            TAGS.push(newTags[i]);
        }
    }
}

function createTags() {
    var html = [];
    for (var i in TAGS) {
        console.log(i, TAGS[i]);
        var tag = TAGS[i];
        var id = 'toggle'+tag;
        html = html.concat([
            '<div class="custom-control custom-checkbox">',
            '<input type="checkbox" class="custom-control-input" id="'+id+'" checked="">',
            '<label class="custom-control-label" for="'+id+'">'+tag+'</label>',
            '</div>'
        ])
    }
    $('#'+ID_TAGS).append($(html.join('')))
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
        row.append($('<td class="filterable-cell">')
            .append(data[i])
        );
    }
}

function createTableDiffRow(parent, data) {
    var $parent = $('#'+parent);
    $parent.find('tbody').append($('<tr class="text-success">'));
    var row = $parent.find('tbody').find('tr').last();
    for (var i in data) {
        row.append($('<td class="filterable-cell" style="padding: 0;">')
            .append(data[i])
        );
    }
}