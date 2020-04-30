/**
 * Created by dtorresp on 4/29/20.
 */

const BREAK_LINE = "\n";
const BLANK_SPACE = " ";
const KEY_ENTER = 13;
const MIN_NUMBER_OF_PARTICIPANTS = 3;
const ANIMATION_DURATION = 2000;
const ANIMATION_ODD_DURATION = 4000;
const SPRITE_DURATION = 50;
const SPRITE_ODD_DURATION = 100;

let helper = {
    getNames: (text) => {
        let lines = text.split(BREAK_LINE);
        return lines.filter((name) => {
            return name !== "";
        });
    },
    capitalize: (name) => {
        if (typeof name !== 'string')
            return '';
        let names = name.split(BLANK_SPACE);
        names.forEach(function (part, index, names) {
            names[index] = names[index].charAt(0).toUpperCase() + names[index].slice(1).toLowerCase();
        });
        return names.join(BLANK_SPACE);
    },
    getCapitalizedNames: (text) => {
        let capitalNames = helper.getNames(text);
        capitalNames.forEach(function (part, index, names) {
            names[index] = helper.capitalize(names[index]);
        });
        return capitalNames;
    },
    buildRow: (ordinal, tableId, style) => {
        let row =
            '<tr>' +
            `<td id='${tableId}_${ordinal}'>` +
            `<span class="label label-${style} p1"></span>` +
            '<span class="hide pr1">&nbsp;🙏&nbsp;</span></div>' +
            `<span class="label label-${style} p2"></span>` +
            '<span class="hide pr2">&nbsp;🙏&nbsp;</span></div>' +
            `<span class="label label-${style} p3"></span>` +
            '</td>' +
            '</tr>';
        return row;
    }
};

let controller = {
    genericAnimator(spriteDuration, animationDuration, callback, forceEndCondition) {
        return new Promise((resolve) => {
            let started = new Date().getTime();

            animationTimer = setInterval(function () {
                let value = callback();
                let forceEnd = false;
                if (forceEndCondition) {
                    forceEnd = forceEndCondition();
                }
                if (new Date().getTime() - started > animationDuration || forceEnd) {
                    clearInterval(animationTimer);
                    resolve(value);
                }
            }, spriteDuration);
        });
    },
    animateAndChoose: (tableId, ordinal, list, person) => {
        return controller.genericAnimator(SPRITE_DURATION, ANIMATION_DURATION,
            () => {
                let previousIndex;
                let chosenIndex = Math.floor(Math.random() * list.length);
                if (!previousIndex) {
                    previousIndex = chosenIndex + 1;
                }
                //FIXME: move the index to a different other than the former one to make the animation look smoother
                //nevertheless it still animates with flickering, figure out a better way.
                if (previousIndex === chosenIndex) {
                    if ((chosenIndex - 1) !== -1) {
                        chosenIndex--;
                    } else {
                        chosenIndex = list.length - 1;
                    }
                }
                previousIndex = chosenIndex;
                $('#' + tableId + '_' + ordinal + ' .p' + person).html(list[chosenIndex]);
                return chosenIndex;
            },
            () => {
                return list.length == 1;
            }
        );
    },
    animateOdd: (tableId, ordinal, person) => {

        return controller.genericAnimator(SPRITE_ODD_DURATION, ANIMATION_ODD_DURATION,
            () => {
                let previousOrdinal;
                let chosenOrdinal = Math.floor(Math.random() * (ordinal + 1));
                if (!previousOrdinal) {
                    previousOrdinal = chosenOrdinal + 1;
                }

                //FIXME: move the index to a different other than the former one to make the animation look smoother
                //nevertheless it still animates with flickering, figure out a better way.
                if (previousOrdinal === chosenOrdinal) {
                    if ((chosenOrdinal - 1) !== -1) {
                        chosenOrdinal--;
                    } else {
                        chosenOrdinal = ordinal;
                    }
                }
                previousOrdinal = chosenOrdinal;
                $('#' + tableId + ' .p3').html('');
                $('#' + tableId + ' .pr2').hide();
                $('#' + tableId + '_' + chosenOrdinal + ' .pr2').show();
                $('#' + tableId + '_' + chosenOrdinal + ' .p3').html(person);

                return chosenOrdinal;
            }
        );
    },
    start: async (men, women) => {
        let scopes = [
            {list: women, tableId: 'womenTable', labelStyle: 'important'},
            {list: men, tableId: 'menTable', labelStyle: 'info'}
        ];

        for (let scope of scopes) {

            switch (scope.list.length) {
                case 0:
                    break;
                case 1:
                    $('#' + scope.tableId + ' tbody').append(helper.buildRow(0, scope.tableId, scope.labelStyle));
                    $('#' + scope.tableId + '_0 .p1').html(scope.list[0]);
                    break;
                case 2:
                    $('#' + scope.tableId + ' tbody').append(helper.buildRow(0, scope.tableId, scope.labelStyle));
                    $('#' + scope.tableId + '_0 .p1').html(scope.list[0]);
                    $('#' + scope.tableId + '_0 .pr1').show();
                    $('#' + scope.tableId + '_0 .p2').html(scope.list[1]);
                    break;
                case 3:
                    $('#' + scope.tableId + ' tbody').append(helper.buildRow(0, scope.tableId, scope.labelStyle));
                    $('#' + scope.tableId + '_0 .p1').html(scope.list[0]);
                    $('#' + scope.tableId + '_0 .pr1').show();
                    $('#' + scope.tableId + '_0 .p2').html(scope.list[1]);
                    $('#' + scope.tableId + '_0 .pr2').show();
                    $('#' + scope.tableId + '_0 .p3').html(scope.list[2]);
                    break;

                default:
                    let ordinal = -1;
                    while (true) {
                        if (scope.list.length > 1) {
                            $('#' + scope.tableId + ' tbody').append(helper.buildRow(++ordinal, scope.tableId, scope.labelStyle));
                            let chosenIndex = await controller.animateAndChoose(scope.tableId, ordinal, scope.list, 1);
                            scope.list.splice(chosenIndex, 1);

                            $('#' + scope.tableId + '_' + ordinal + ' .pr1').show();

                            chosenIndex = await controller.animateAndChoose(scope.tableId, ordinal, scope.list, 2);
                            scope.list.splice(chosenIndex, 1);
                        } else if (scope.list.length == 1) {
                            await controller.animateOdd(scope.tableId, ordinal, scope.list[0]);
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
            }
            $('#' + scope.tableId + ' .ready').show();

        }
    }
};

$(document).ready(function () {
    $("#btnReady").click((event) => {
        $("#it1Error").hide();
        let men = helper.getCapitalizedNames($("#txMen").val());
        let women = helper.getCapitalizedNames($("#txWomen").val());
        if ((men.length + women.length) === 0) {
            $("#it1Error").html("No pue, inclúyete tú al menos 😒");
            $("#it1Error").show('slow').delay(3000).hide('slow');
            return;
        }
        if ((men.length + women.length) === 1) {
            $("#it1Error").html("Ni modo, ora tu nomás 😅");
            $("#it1Error").show('slow').delay(3000).hide('slow');
            return;
        }

        let menQualified = men.length > MIN_NUMBER_OF_PARTICIPANTS;
        let womenQualified = women.length > MIN_NUMBER_OF_PARTICIPANTS;

        if (!(menQualified || womenQualified)) {
            $("#it1Error").html("Muy pocos, oren entre ustedes nomás 😅");
            $("#it1Error").show('slow').delay(3000).hide('slow');
            return;
        }

        $('#mainCarousel').carousel('next');
        $('#mainCarousel').carousel('pause');

        if (men.length === 0) {
            $('#menTable').hide();
        }
        if (women.length === 0) {
            $('#womenTable').hide();
        }

        controller.start(men, women);

    });
    $("#txMen, #txWomen").keyup((event) => {
        let names = helper.getCapitalizedNames(event.target.value);
        let counter = event.target.dataset.counter;
        $('#' + counter).html(names.length);
        let newValue = names.join(BREAK_LINE);
        if (event.keyCode === KEY_ENTER) {
            newValue += BREAK_LINE;
        }
        event.target.value = newValue;
    });

});


