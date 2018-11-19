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
    const $inStipend = $("#aacalc_stipend");
    const $spPrice = $("#aacalc_price");
    var mats;
    var modifiers;
    var routes;
    var curZone;
    var curPack;
    var curOutlet;
    var curType;
    var curQuality;
    var curStage;
    var multDemand;
    var war;
    var stipend;

    function refreshMats() {
        var items = routes[curZone].packs[curPack].mats;
        var matsHtml = "";
        items.forEach(function (item) {
            var matData = mats.find((n) => n.name === item.name);
            var dispPrice = (function () {
                if (matData === undefined) { return "No data"; }
                if (!matData.hasOwnProperty("price")) { return "N/A"; }
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
        var options = "", upperDuration = 0, lowerDuration = 0;
        modifiers.pack_quality[curQuality].stages.forEach(function (q, i) {
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

    function refreshPrice() { //super dirty
        var p = routes[curZone].packs[curPack].outlets[curOutlet].price;
        p *= multDemand;
        p *= modifiers.pack_quality[curQuality].stages[curStage].multiplier;
        p *= modifiers.interest;
        if (war) { p *= modifiers.war_bonus; }
        if (stipend) { p *= modifiers.stipend_bonus; }
        $spPrice.html(p);

        var curTypeID = modifiers.pack_type.findIndex((t) => t.name === curType)
        var c = modifiers.pack_type[curTypeID].craft_fee;
        var items = routes[curZone].packs[curPack].mats;
        items.forEach(function (item) {
            var matData = mats.find((n) => n.name === item.name);
            var matPrice = (function () {
                if (matData === undefined || !matData.hasOwnProperty("price")) { return 0; }
                return matData.price;
            })();
            c += item.quantity * matPrice;
        });
        $("#aacalc_cost").html(c);

        var pr = p - c;
        $("#aacalc_profit").html(pr);

        var l = modifiers.pack_type[curTypeID].labor_cost;
        l += modifiers.labor_sell;
        $("#aacalc_laborcost").html(l);

        var pl = pr / l;
        $("#aacalc_profitperlabor").html(pl);
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
            multDemand = modifiers.demand_max / 100;

            refreshRouteList($selZone);
        });
    }

    $(function () {
        initializeApp();
    });

    $selZone.change(function () {
        curZone = $selZone.find(":selected").attr("value");
        curQuality = modifiers.pack_quality.findIndex((q) => q.name === routes[curZone].quality);

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
        var demand;
        if (!Number.isInteger(val)) { demand = Math.floor(val); }
        if (val > modifiers.demand_max) { demand = modifiers.demand_max; }
        else if (val < modifiers.demand_min) { demand = modifiers.demand_min; }

        $inDemand.val(demand);
        multDemand = demand / 100;
    });

    $selTime.change(function () {
        curStage = $selTime.find(":selected").attr("value");
        refreshPrice();
    });
});