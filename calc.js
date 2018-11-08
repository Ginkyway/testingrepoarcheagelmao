var packsdata

$(document).ready(function () {
    $.when($.getJSON("packs.json")).done(function (data) {
        packsdata = data;
        console.log("Loaded packs.json");
        initLists();

    });
});

function initLists() {
    // Populate region list (only done once)
    for (i = 0; i < packsdata.length; i++) {
        var option = $("<option></option>").text(packsdata[i].region);
        option.attr("value", i);
        $("#region").append(option);
    };

    // Populate packs
    var regionID = $("#region").find(":selected").attr("value");
    for (i = 0; i < packsdata[regionID].packs.length; i++) {
        var option = $("<option></option>").text(packsdata[regionID].packs[i].name);
        option.attr("value", i);
        $("#pack").append(option);
    };

    //Populate outlets
    var packID = $("#pack").find(":selected").attr("value");
    for (i = 0; i < packsdata[regionID].packs[packID].prices.length; i++) {
        var option = $("<option></option>").text(packsdata[regionID].packs[packID].prices[i].outlet);
        option.attr("value", i);
        $("#outlet").append(option);
    };
}