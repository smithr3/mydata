/**
 * Created by Robert on 31/01/2019.
 */

// todo
// filter by tags
// filter by unit
// compare everything to > select one (drop down list probably, or checkboxes next to rows), then change unit col to name of thing
// options - unit conversions and display
// options - differences, colours
// options - bar behind value, or row, representing relation to min/max values
// subtitle/description - name: Jupiter, sub: radius    OR name: Jupiter's radius, sub: largest planet in solar system

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
var TAGS = {}; // {name:state} populated after data read in cleanData()
var TAG_NAMES = []; // just the names of tags, populated at same time and in same order as TAGS
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
        callback: initData,
        simpleSheet: true
    });
    // DON'T PUT ANYTHING HERE THAT NEEDS THE TABLE TO HAVE BEEN READ IN
}

function initData(data, tabletop) {
    // save data and tabletop globally
    DATA = data;
    TABLETOP = tabletop;
    cleanData();
    createTags();
    createTable();
}

function cleanData() {
    // call before createTags() otherwise TAGS will be an empty array
    for (var i in DATA) {
        var row = DATA[i];
        row.number = parseFloat(row.value) * Math.pow(10, parseFloat(row.mag));
        row.tags = readTags(row.tags);
        addToTags(row.tags);
    }
}

function createTable(opt) {
    // goal: pass in only the options that are changing

    clearTable();

    var i, row;
    // create table rows
    for (i=0; i<DATA.length; i++) {
        row = DATA[i];
        //console.log(row.name, shouldShow(row.tags));
        if (!shouldShow(row.tags)) {
            continue;
        }
        createTableRow(null, ID_TABLE, [
            capitalise(row.name),
            row.number,
            row.unit
        ]);
        // create difference rows
        //if (i < DATA.length - 1) {
        //    createTableDiffRow(ID_TABLE, [
        //        '',
        //        '&#8681; &#8659; &#8711; x' + roundToSigFig(
        //            DATA[i+1].number / DATA[i].number,
        //            2
        //        )*100 + '%',
        //        ''
        //    ]);
        //}
    }
}

function clearTable() {
    $('#'+ID_TABLE).find('tbody').empty();
}

function readTags(tags) {
    // tags a string of comma separate tags and converts to a list
    tags = tags.split(',');
    var newTags = [];
    for (var i in tags) {
        var t = capitalise(tags[i].trim());
        if (t != '') {
            newTags.push(t);
        }
    }
    return newTags;
}

function capitalise(text) {
    // replace beginning of word with capital
    // ?! looks ahead, and matching anything not \s
    return text.replace(/(\b[a-z](?!\s))/g, function(x){ return x.toUpperCase()});
}

function addToTags(newTags) {
    //console.log('newtags', newTags, typeof(newTags));
    for (var i in newTags) {
        var t = newTags[i];
        //if (TAG_NAMES.indexOf(t) == -1) {
        if (TAGS[t] == undefined) {
            TAGS[t] = true;
            TAG_NAMES.push(t)
        }
    }
}

function createTags() {
    // call cleanData() first to read in all tags
    var html = [];
    for (var i in TAGS) {
        var tag = i;
        var id = 'tag'+tag;
        html = html.concat([
            '<div class="custom-control custom-checkbox">',
            '<input type="checkbox" class="custom-control-input" id="'+id+'" checked="">',
            '<label class="custom-control-label" for="'+id+'">'+tag+'</label>',
            '</div>'
        ])
    }
    $('#'+ID_TAGS).append($(html.join('')))
}

function shouldShow(tags) {
    // using stored state of filters
    for (var i in TAGS) {
        if (TAGS[i]) {
            for (var j in tags) {
                if (i == tags[j]) {
                    return true;
                }
            }
        }
    }
    // by reading the states of the html
    //var checked;
    //for (var i in TAG_NAMES) {
    //    checked = $('#tag'+TAG_NAMES[i]).is(':checked');
    //    if (checked) {
    //        for (var j in tags) {
    //            if (TAG_NAMES[i] == tags[j]) {
    //                return true;
    //            }
    //        }
    //    }
    //}
    return false;
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

$(document).on('change', '[type=checkbox]', function() {
    if (this.id.indexOf('tag') == 0 ) {
        var $this = $('#'+this.id);
        var label = $this.next().text();
        var checked = $this.is(':checked');
        TAGS[label] = checked;
        createTable();
    }
});