$(function () {
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
            var option = $("<option></option>").text(packsdata[i].zone);
            option.attr("value", i);
            $("#zone").append(option);
        };

        refreshLists();
    }

    function refreshLists() {
        // Populate packs
        var zoneID = $("#zone").find(":selected").attr("value");
        for (i = 0; i < packsdata[zoneID].packs.length; i++) {
            var option = $("<option></option>").text(packsdata[zoneID].packs[i].name);
            option.attr("value", i);
            $("#pack").append(option);
        };

        //Populate outlets
        var packID = $("#pack").find(":selected").attr("value");
        for (i = 0; i < packsdata[zoneID].packs[packID].prices.length; i++) {
            var option = $("<option></option>").text(packsdata[zoneID].packs[packID].prices[i].outlet);
            option.attr("value", i);
            $("#outlet").append(option);
        };
    }

    $("#zone").change(function () {
        console.log("Zone changed");
        if (packsdata !== undefined) {
            refreshLists();
        }
    });
});