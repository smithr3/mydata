/**
 * Created by Robert on 31/01/2019.
 */

// todo
// search
// sort asc/desc
// update diff to work
// options - differences, colours
// options - unit conversions and display
// compare everything to > select one (drop down list probably, or checkboxes next to rows), then change unit col to name of thing
// options - bar behind value, or row, representing relation to min/max values
// subtitle/description - name: Jupiter, sub: radius    OR name: Jupiter's radius, sub: largest planet in solar system
// formatting units with something. mathjax? katex?

// check out table sorting, any libraries I may want to use
// HTML mock up filters, then implement js
// may need https://mdbootstrap.com/

window.addEventListener('DOMContentLoaded', init);

/***********************************************************************************************************************
        GLOBALS and CONSTANTS
***********************************************************************************************************************/
var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1ht99t3Ok4m9FB42giTvz3qSi9nZGq1jYMpKaS4DvDEg/edit?usp=sharing';
var ID_TABLE = 'table0'; // main table
var ID_UNITS = 'units'; // where to create units checkbox filters
var ID_TAGS = 'tags'; // where to create tags checkbox filters

var DATA = null; // global for data, assigned in showInfo once read in
var TABLETOP = null; // tabletop object for data, assigned in showInfo once read in
var TAGS = {}; // {name:state} populated after data read in cleanData()
var TAG_NAMES = []; // just the names of tags, populated at same time and in same order as TAGS
var UNITS = { // maps unit to dimension
    unitless : [''],
    length : ['m', 'km', 'ft'],
    mass : ['kg'],
    speed : ['m/s', 'kph', 'km/h'],
    area : ['km^2'],
    perArea : ['/km^2'],
    temperature : ['C', 'K'],
    energy : ['J']
};
var UNITS_STATE = {}; // {mass:true, ...} is corresponding unit checkbox checked, generated from UNITS
for (var i in UNITS) {
    UNITS_STATE[i] = true;
}


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
    createUnits();
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
        if (!shouldShow(row.tags, row.unit)) {
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
        html.push(createCheckbox(id, tag, true)); // note setting false won't update DOM because TAGS isn't updated
    }
    $('#'+ID_TAGS).append($(html.join('')))
}

function createUnits() {
    var html = [];
    for (var i in UNITS) {
        var id = 'unit' + i;
        var label = i;
        html.push(createCheckbox(id, label, true));
    }
    $('#'+ID_UNITS).append($(html.join('')))
}

function shouldShow(tags, unit) {
    // unit MUST be selected, and ONE of the rows tags must be selected
    var i, j;
    var dim = null;
    // first map row.unit to a dimension (eg. hm/h to speed)
    for (i in UNITS) {
        for (j in UNITS[i]) { // thru list of ['m/s', 'km/h', ...]
            if (unit == UNITS[i][j]) {
                dim = i; // eg. 'speed'
                break;
            }
        }
        if (dim != null) {
            break;
        }
    }
    if (dim == null) {
        alert("Couldn't match "+unit+" to a dimension.");
    }
    // if that unit is not selected, don't show, otherwise continue and check tags
    if (!UNITS_STATE[dim]) {
        return false;
    }
    // if a single tag from 'tags' is selected, then show row
    // using stored state of filters
    for (i in TAGS) {
        if (TAGS[i]) {
            for (j in tags) {
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

function createCheckbox(id, label, checked) {
    var c = '';
    if (checked) {
        c = 'checked=""';
    }
    return [
        '<div class="custom-control custom-checkbox">',
        '<input type="checkbox" class="custom-control-input" id="'+id+'" '+c+'>',
        '<label class="custom-control-label" for="'+id+'">'+label+'</label>',
        '</div>'
    ].join('');
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

function getCheckbox(id) {
    // get checked state of a checkbox with the given id, and return it's label
    var $this = $('#'+id);
    var label = $this.next().text();
    var checked = $this.is(':checked');
    return {
        label : label,
        checked : checked
    }
}

$(document).on('change', '[type=checkbox]', function() {
    var id = this.id;
    var box;
    if (id.indexOf('tag') == 0 ) {
        box = getCheckbox(id);
        TAGS[box.label] = box.checked;
        createTable();
    } else if (id.indexOf('unit') == 0) {
        box = getCheckbox(id);
        UNITS_STATE[box.label] = box.checked;
        createTable();
    }
});

//$(document).ready(function() {
//    $('label').on('click', function() {
//        console.log($(this));
//    });
//});

// mouse down state tracking
var mouseDown = 0;
document.body.onmousedown = function() {
    mouseDown = 1;
};
document.body.onmouseup = function() {
    mouseDown = 0;
};

$(document).on('mouseenter', 'label', function() {
    // allows drag toggling of checkboxes
    // todo instead of inverting, set all states to same as first
    // todo inverting of intended on first checkbox if click-drag started inside it
    if (mouseDown) {
        var $box = $(this).prev();
        var current = $box.prop('checked');
        $box.prop('checked', !current); // doesn't fire events
        $box.trigger('change');
    }
});

