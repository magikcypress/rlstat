    $(document).ready(function() {
        $("#slider").slider({
            min: 200,
            max: 5000,
            value: 300,
            step: 100,
            change: function(event, ui) {
                var new_updaterate = ui.value;
                if (new_updaterate != updaterate && new_updaterate != 0)
                {
                    console.log("Update rate changed to: "+new_updaterate);
                    clearInterval(updateTimer);
                    updaterate = new_updaterate;
                    $("#refreshrate").text("Current update rate: "+updaterate+"ms");
                    chart.animation.duration = updaterate/2;
                    updateTimer = setInterval(updateTimerCallback, updaterate);
                }
            }
        });
        $("#refreshrate").text("Current update rate: "+updaterate+"ms");
    });
