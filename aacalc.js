"use strict";
$(function () {
    const $divContainer = $("#aacalc_container");
    const $divRoute = $("#aacalc_section_route");
    const $divModifiers = $("#aacalc_section_modifiers");
    const $divOutput = $("#aacalc_section_output");
    const $divMats = $("#aacalc_mats");
    const $selZone = $("#aacalc_zone");
    const $selPack = $("#aacalc_pack");
    const $selOutlet = $("#aacalc_outlet");
    const $selTime = $("#aacalc_time");
    const $selCommerceProf = $("#aacalc_commerceprof");
    const $selHusbandryProf = $("#aacalc_husbandryprof");
    const $inDemand = $("#aacalc_demand");
    const $inWar = $("#aacalc_war");
    const $spPrice = $("#aacalc_price");
    var mats;
    var modifiers;
    var routes;
    var curZone;
    var curPack;
    var curOutlet;
    var curType;
    var multDemand;
    var multQuality;
    var isWar;

    function refreshMats() {
        var items = routes[curZone].packs[curPack].mats;
        var matsHtml = "";
        items.forEach(function (item) {
            var matData = mats.find((n) => n.name === item.name);
            var dispPrice = (function () {
                if (matData === undefined) return "No data";
                if (!matData.hasOwnProperty("price")) return "N/A";
                return matData.price;
            })();
            matsHtml += "<div class='aacalc_mat_item'>" +
                "<span class='aacalc_mat_name'>" +
                item.name +
                "</span>" +
                "<span class='aacalc_mat_quantity'>" +
                "x " + item.quantity +
                "</span>" +
                "<span class='aacalc_mat_price'>"
                + dispPrice +
                "</span>" +
                "</div>";
        });
        $divMats.html(matsHtml);
    }

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
            options +=
                "<option value=" + i + ">" +
                item.name +
                "</option>";
        });
        $list.html(options);
        $list.val(0).change();
    }

    function refreshDeliveryTime() {
        var qIndex = modifiers.pack_quality.findIndex((q) => q.name === routes[curZone].quality);
        var options = "", upperDuration = 0, lowerDuration = 0;
        modifiers.pack_quality[qIndex].stages.forEach(function (q, i) {
            if (i === 0) {
                upperDuration += q.duration;
                options +=
                    "<option value=" + i + ">" +
                    "&lt; " + upperDuration + " minutes" +
                    "</options>";
            }
            else if (q.hasOwnProperty("duration")) {
                upperDuration += q.duration;
                options +=
                    "<option value=" + i + ">" +
                    lowerDuration + " - " + upperDuration + " minutes" +
                    "</options>";
            }
            else {
                options +=
                    "<option value=" + i + ">" +
                    "&gt; " + upperDuration + " minutes" +
                    "</options>";
            }
            lowerDuration = upperDuration;
        });
        $selTime.html(options);
    }

    function initializeApp() {
        $.when(
            $.getJSON("json/mats.json"),
            $.getJSON("json/modifiers.json"),
            $.getJSON("json/routes.json")
            ).done(function (_mats, _modifiers, _routes) {
            mats = _mats[0];
            modifiers = _modifiers[0];
            routes = _routes[0];
            
            var options = "";
            modifiers.labor_proficiency.forEach(function (prof, i) {
                options +=
                    "<option value=" + i + ">" +
                    prof.name +
                    "</option>";
            });
            $selCommerceProf.html(options);
            $selHusbandryProf.html(options);
            $inDemand.prop({
                "max": modifiers.demand_max,
                "min": modifiers.demand_min,
                "step": 1,
                "value": modifiers.demand_max
            });
            
            refreshRouteList($selZone);
        });
    }

    $(function () {
        initializeApp();
    });

    $selZone.change(function () {
        curZone = $selZone.find(":selected").attr("value");
        refreshRouteList($selPack);
        refreshDeliveryTime();
    });

    $selPack.change(function () {
        curPack = $selPack.find(":selected").attr("value");
        curType = routes[curZone].packs[curPack].type;

        if (modifiers.pack_quality_exclude.includes(curType)) {
            $selTime.prop("disabled", true);
        }
        else {
            $selTime.prop("disabled", false);
        }

        refreshMats();
        refreshRouteList($selOutlet);
    });

    $selOutlet.change(function () {
        curOutlet = $selOutlet.find(":selected").attr("value");

        if (modifiers.war_zones.includes($(this).find(":selected").text())) {
            $inWar.prop("disabled", false);
        }
        else {
            $inWar.prop({ "disabled": true, "checked": false });
        }
    });

    $inDemand.change(function () {
        var val = $inDemand.val();
        if (!Number.isInteger(val))
            $inDemand.val(Math.floor(val));
        if (val > modifiers.demand_max)
            $inDemand.val(modifiers.demand_max);
        else if (val < modifiers.demand_min)
            $inDemand.val(modifiers.demand_min);
        
        multDemand = $inDemand.val() / 100;
    });

    $selTime.change(function () {
        var qIndex = $selTme.find(":selected").attr("value");
    });
});