"use strict";
$(function () {
    const $divContainer = $("#aacalc_container"), $divRoute = $("#aacalc_section_route"), $divModifiers = $("#aacalc_section_modifiers"), $divOutput = $("#aacalc_section_output");
    const $selZone = $("#aacalc_zone"), $selPack = $("#aacalc_pack"), $selOutlet = $("#aacalc_outlet");
    const $selTime = $("#aacalc_time"), $selCommerceProf = $("#aacalc_commerceprof"), $selHusbandryProf = $("#aacalc_husbandryprof");
    const $inDemand = $("#aacalc_demand"), $inWar = $("#aacalc_war");
    const $spPrice = $("#aacalc_price");
    var mats, modifiers, routes, curZone, curPack, curOutlet;

    function refreshRouteList($list) {
        $list.empty();
        var items;
        switch ($list) {
            case $selZone:
                items = routes;
                curZone = 0;
                break;
            case $selPack:
                items = routes[curZone].packs;
                curPack = 0;
                break;
            case $selOutlet:
                items = routes[curZone].packs[curPack].outlets;
                curOutlet = 0;
                break;
        }
        var options = "";
        items.forEach(function (item, i) {
            options += "<option value=" + i + ">" + item.name + "</option>";
        });
        $list.html(options);
        $list.val(0).change();
    }

    function refreshDeliveryTime() {
        var qualityIndex = modifiers.pack_quality.findIndex((q) => q.name === routes[curZone].quality);
        var options = "", upperDuration = 0, lowerDuration = 0;
        modifiers.pack_quality[qualityIndex].stages.forEach(function (q, i) {
            if (i === 0) { // display different text depending on position
                upperDuration += q.duration;
                options +=
                    "<option value=" +
                    i +
                    ">&lt; " +
                    upperDuration +
                    " minutes</options>";
            }
            else if (q.hasOwnProperty("duration")) {
                upperDuration += q.duration;
                options +=
                    "<option value=" +
                    i +
                    ">" +
                    lowerDuration +
                    " - " +
                    upperDuration +
                    " minutes</options>";
            }
            else {
                options +=
                    "<option value=" +
                    i +
                    ">&gt; " +
                    upperDuration +
                    " minutes</options>";
            }
            lowerDuration = upperDuration;
        });
        $selTime.html(options);
    }

    function initialize() {
        var options = "";
        modifiers.labor_proficiency.forEach(function (prof, i) {
            options += "<option value=" + i + ">" + prof.name + "</option>";
        });
        $selCommerceProf.html(options);
        $selHusbandryProf.html(options);
        $inDemand.prop({
            "max": modifiers.demand_max * 100,
            "min": modifiers.demand_min * 100,
            "step": 1,
            "value": modifiers.demand_max * 100
        });

        refreshRouteList($selZone);
    }

    function loadData() {
        $.when(
            $.getJSON("json/mats.json"),
            $.getJSON("json/modifiers.json"),
            $.getJSON("json/routes.json")
        ).done(function (_mats, _modifiers, _routes) {
            mats = _mats[0];
            modifiers = _modifiers[0];
            routes = _routes[0];

            initialize();
        });
    }

    // function refreshOutput() {

    // }

    $(function () {
        loadData();
    });

    $selZone.change(function () {
        curZone = $(this).find(":selected").attr("value");
        refreshRouteList($selPack);
        refreshDeliveryTime();
    });

    $selPack.change(function () {
        curPack = $(this).find(":selected").attr("value");

        if (modifiers.pack_quality_exclude.includes(routes[curZone].packs[curPack].type)) {
            $selTime.prop("disabled", true);
        }
        else {
            $selTime.prop("disabled", false);
        }

        refreshRouteList($selOutlet);
    });

    $selOutlet.change(function () {
        curOutlet = $(this).find(":selected").attr("value");

        if (modifiers.war_zones.includes($(this).find(":selected").text())) {
            $inWar.prop("disabled", false);
        }
        else {
            $inWar.prop({ "disabled": true, "checked": false });
        }
    });

    $inDemand.change(function () {
        var val = $(this).val();
        if (!Number.isInteger(val)) $(this).val(Math.floor(val));
        if (val > 130) $(this).val(130);
        else if (val < 70) $(this).val(70);
    });
});