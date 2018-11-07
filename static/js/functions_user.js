$(document).ready(function() {
    recordarray = [];
    dataresult = "";

    window.speechSynthesis.onvoiceschanged = function() {
        loadVoices();
    };
    $("#chatbox").keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();

            newEntry();
        }
    });
    $("#rec").click(function(event) {
        switchRecognition();
    });
    $("#event").click(function(event) {
        newEntry();
        $.ajax({
            type: "POST",
            url: baseUrl + "contexts?sessionId=241187",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            data: JSON.stringify([{
                name: 'medication-followup',
                lifespan: 5
            }]),
        });
        $.ajax({
            type: "POST",
            url: baseUrl + "query?v=20170712",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            data: JSON.stringify({
                event: {
                    name: 'prescription_event',
                    data: {
                        'doctor': 'Dr SAM',
                        disease: 'Cold',
                        medicine: 'CROCIN COLD & FLUMAX TABLETS',
                        days: '20'
                    }
                },
                timezone: 'America/New_York',
                lang: 'en',
                sessionId: '241187'
            }),

            success: function(data) {
                setResponse(JSON.stringify(data, undefined, 2));
                setAudioResponse(data);

            },
            error: function() {
                setResponse("Internal Server Error");
            }
        });
    });



    $('#modalopen').click(function() {
        $('.input-field .dropdown-content').on('mousewheel DOMMouseScroll', function(e) {

            e.stopPropagation()
        });
        $('.input-field .dropdown-content li').scroll(function(e) {
            e.stopPropagation();
        })

        if ($('#modal1').hasClass('slide-right')) {
            $('#modal1').addClass('slide-left', 1000, 'easeOutBounce');
            $('#modal1').removeClass('slide-right');
        }
    });

    $(".grid-container .margin-top").click(function() {
        $('#modal1').removeClass('slide-left');
        $('#modal1').addClass('slide-right', 1000, 'easeOutBounce');
    });

    //Socket io related code goes over here
    //var socket = io.connect('https://deloitte-hr-manager.herokuapp.com');
    var socket = io.connect('http://localhost:5001');
    socket.on('chartdata', function(data) {
        var chartdetail = JSON.parse(data);
        var length = chartdetail.length;
        var width = 600;
        var height = 300;
        var chartdetail;
            chartdetail.forEach(function(val, index, theArray) {
                CreateChart(val);
                status = true;
            });

    function CreateChart(data) {
        var chartdatum = data;
        FusionCharts.setCurrentRenderer('javascript');
        FusionCharts.ready(function() {
             var visitChart = new FusionCharts({
                 type: chartdatum.type,
                 id: chartdatum.chartcontainer,
                 renderer: 'javascript',
                 renderAt: chartdatum.chartcontainer,
                 width: '1400px',
                 height: '700px',
                 dataFormat: 'json',
                 dataSource: {
                    "chart": {
                    "caption": chartdatum.caption,
                    "subCaption": chartdatum.subCaption,
                    "xAxisName": chartdatum.xAxisName,
                    "yAxisName": chartdatum.yAxisName,
                    "lineThickness": "2",
                    "exportEnabled": '1',
                    "paletteColors": "#009688",
                    "baseFontColor": "#333333",
                    "baseFont": "Helvetica Neue,Arial",
                    "captionFontSize": "14",
                    "subcaptionFontSize": "14",
                    "subcaptionFontBold": "0",
                    "showBorder": "0",
                    "bgColor": "#ffffff",
                    "showShadow": "0",
                    "canvasBgColor": "#ffffff",
                    "canvasBorderAlpha": "0",
                    "divlineAlpha": "100",
                    "divlineColor": "#999999",
                    "divlineThickness": "1",
                    "divLineIsDashed": "1",
                    "divLineDashLen": "1",
                    "divLineGapLen": "1",
                    "showXAxisLine": "1",
                    "xAxisLineThickness": "1",
                    "xAxisLineColor": "#999999",
                    "showAlternateHGridColor": "0"
                        },
                        "data": chartdatum.source
                    }
                });
                visitChart.render();
                $('#chartshow')[0].scrollIntoView(true);
            });
        }
        $(".panel-heading").css("display", "inline-block");
    });

    socket.on('chartgoogledata', function(data) {
        var chartdetail = JSON.parse(data);
        var length = chartdetail.length;
        var width = 1400;
        var height = 700;
        var options = {};

        chartdetail.forEach(function(val, index, theArray) {
            options = {
                    title: val.caption,
                    width: width,
                    height: height,
                    animation: {
                        duration: 1000,
                        easing: 'inAndOut',
                        startup: true
                    },
                     hAxis: {
                              title: val.xAxisName
                            },
                             vAxis: {
                                      title: val.yAxisName
                                    },
                                    legend: { position: "bottom" }
                };
            //console.log("Chart Type is : " + val.type);
            if (val.type == "geochart") {
                CreateGeoChart(val);
            } else if (val.type == "line") {
                CreateLineChart(val);
            } else if (val.type == "bar") {
                CreateColumnChart(val);
            } else if (val.type == "donut") {
                CreateDonutChart(val);
            } else if (val.type == "sankey") {
                CreateSankeyChart(val);
            } else if (val.type == "tree") {
                CreateTreeChart(val);
            }else if (val.type == "area") {
                CreateAreaChart(val);
            } else if (val.type == "bubble") {
                CreateBubbleChart(val);
            } else if (val.type == "trend") {
                CreateComboChart(val);
            }
            status = true;
        });

        function CreateAreaChart(data) {
            var chartdatum = data;
              var result = [];
            result.push(Object.keys(chartdatum.source[0]));
                for (var i in chartdatum.source) {
                    chartdatum.source[i].value = parseFloat(chartdatum.source[i].value);
                    result.push(Object.values(chartdatum.source[i]));
                }
                google.charts.load('current', {
                'packages': ['corechart'],
                //'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
            });
                 google.charts.setOnLoadCallback(drawChart);

                function drawChart() {
                    var data = google.visualization.arrayToDataTable(result);
                    var chart = new google.visualization.AreaChart(document.getElementById('barchart'));
                    chart.draw(data, options);
                }
        }

        function CreateBubbleChart(data) {
            var chartdatum = data;
            var result = [];
            result.push(Object.keys(chartdatum.source[0]));
                for (var i in chartdatum.source) {
                    chartdatum.source[i].value = parseFloat(chartdatum.source[i].value);
                    result.push(Object.values(chartdatum.source[i]));
                }
                google.charts.load('current', {
                'packages': ['corechart']});
                 google.charts.setOnLoadCallback(drawChart);

                function drawChart() {
                    //var data = google.visualization.arrayToDataTable(result);
                    var data = google.visualization.arrayToDataTable([
                      ['ID', 'X', 'Y', 'Temperature'],
                      ['',   80,  167,      120],
                      ['',   79,  136,      130],
                      ['',   78,  184,      50],
                      ['',   72,  278,      230],
                      ['',   81,  200,      210],
                      ['',   72,  170,      100],
                      ['',   68,  477,      80]
                    ]);

                    var options = {
                      colorAxis: {colors: ['yellow', 'red']}
                    };

                    var chart = new google.visualization.BubbleChart(document.getElementById('barchart'));
                    chart.draw(data, options);
                }
        }


//        function CreateTreeChart(data) {
//            var chartdatum = data;
//                google.charts.load('current', {
//                'packages': ['treemap']
//            });
//            google.charts.setOnLoadCallback(drawChart);
//            function drawChart() {
//                var data = google.visualization.arrayToDataTable([
//                  ['Location', 'Parent', 'Market trade volume (size)', 'Market increase/decrease (color)'],
//                  ['Global',    null,                 0,                               0],
//                  ['America',   'Global',             0,                               0],
//                  ['Europe',    'Global',             0,                               0],
//                  ['Asia',      'Global',             0,                               0],
//                  ['Australia', 'Global',             0,                               0],
//                  ['Africa',    'Global',             0,                               0],
//                  ['Brazil',    'America',            11,                              10],
//                  ['USA',       'America',            52,                              31],
//                  ['Mexico',    'America',            24,                              12],
//                  ['Canada',    'America',            16,                              -23],
//                  ['France',    'Europe',             42,                              -11],
//                  ['Germany',   'Europe',             31,                              -2],
//                  ['Sweden',    'Europe',             22,                              -13],
//                  ['Italy',     'Europe',             17,                              4],
//                  ['UK',        'Europe',             21,                              -5],
//                  ['China',     'Asia',               36,                              4],
//                  ['Japan',     'Asia',               20,                              -12],
//                  ['India',     'Asia',               40,                              63],
//                  ['Laos',      'Asia',               4,                               34],
//                  ['Mongolia',  'Asia',               1,                               -5],
//                  ['Israel',    'Asia',               12,                              24],
//                  ['Iran',      'Asia',               18,                              13],
//                  ['Pakistan',  'Asia',               11,                              -52],
//                  ['Egypt',     'Africa',             21,                              0],
//                  ['S. Africa', 'Africa',             30,                              43],
//                  ['Sudan',     'Africa',             12,                              2],
//                  ['Congo',     'Africa',             10,                              12],
//                  ['Zaire',     'Africa',             8,                               10]
//                ]);
//                var chart = new google.visualization.TreeMap(document.getElementById('barchart'));
//                chart.draw(data, { minColor: '#f00',midColor: '#ddd',maxColor: '#0d0',headerHeight: 15,fontColor: 'black',showScale: true});
//                }
//        }
        function CreateTreeChart(data) {
            var chartdatum = data;
            var sourceData = chartdatum.source;
                google.charts.load('current', {
                'packages': ['treemap']
            });

            google.charts.setOnLoadCallback(drawChart);
                var result = [];
                var j = 2;
                result.push(Object.keys(chartdatum.source[0]));
                result[0].push("size", "color");
                result.push(["Global",null,0,0]);
                    for (var i in chartdatum.source) {
                    chartdatum.source[i].value = parseFloat(chartdatum.source[i].value);
                    result.push(Object.values(chartdatum.source[i]));
                    result[parseInt(j)+parseInt(i)].push(chartdatum.source[i].value);
                    result[parseInt(j)+parseInt(i)].splice( 1, 0, 'Global');
                    }
            function drawChart() {
            var data = google.visualization.arrayToDataTable(result);
               /* var data = google.visualization.arrayToDataTable([
                  ['Product', 'Parent', 'Market trade volume (size)', 'Market increase/decrease (color)'],
                  ['Products',    null,             0,                             0],
                  ['Avastin',    'Products',             20,                             20],
                  ['Lipitor',    'Products',             35,                             35],
                  ['Herceptin',  'Products',             54,                              54],

                ]);*/
                var chart = new google.visualization.TreeMap(document.getElementById('barchart'));
               chart.draw(data,options);
                }
        }

        function CreateGeoChart(data) {
            var chartdatum = data;

            var result = [];
            //Need proper handling
            result.push(Object.keys(chartdatum.source[0]));
            for (var i in chartdatum.source) {
                chartdatum.source[i].value = parseFloat(chartdatum.source[i].value);
                result.push(Object.values(chartdatum.source[i]));
            }
            //result.push(Object.keys(source[0]));
//            for (var i in source) {
//                source[i].value = parseFloat(source[i].value);
//                result.push(Object.values(source[i]));
//            }
            google.charts.load('current', {
                'packages': ['geochart'],
                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
            });
            google.charts.setOnLoadCallback(drawRegionsMap);
            function drawRegionsMap() {
                var data = google.visualization.arrayToDataTable(result);
                var chart = new google.visualization.GeoChart(document.getElementById('barchart'));
                chart.draw(data, options);
            }
        }


        function CreateDonutChart(data) {
            var chartdatum = data;
            var result = [];
            //Need proper handling
            result.push(Object.keys(chartdatum.source[0]));
            for (var i in chartdatum.source) {
                chartdatum.source[i].value = parseFloat(chartdatum.source[i].value);
                result.push(Object.values(chartdatum.source[i]));
            }
            google.charts.load('current', {
                'packages': ['corechart'],
                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
            });
            google.charts.setOnLoadCallback(drawChart);
            function drawChart() {
                var data = google.visualization.arrayToDataTable(result);
                    var options = {
                      pieHole: 0.5,
                      pieSliceTextStyle: {
                        color: 'black',
                      },
                      legend: 'none'
                    };
                var chart = new google.visualization.PieChart(document.getElementById('barchart'));
                chart.draw(data, options);
            }
        }

//        function CreateLineChart(data) {
//            //var chartdatum = data;
//            //  if(length == 1){
//            // 	   width = 900;
//            // 	   height= 500;
//            //  }
//
//            //var chartdetail = JSON.parse(data)
//            //var data = jQuery.parseJSON(JSON.stringify(data))
//            console.log(data)
//            var chartdatum = data;
//            var result = [];
//            result.push(Object.keys(chartdatum.source[0]));
//            console.log(Object.keys(chartdatum.source[0]));
//            //console.log(data)
//            for (var i in chartdatum.source) {
//                chartdatum.source[i].value = parseFloat(chartdatum.source[i].value);
//                result.push(Object.values(chartdatum.source[i]));
//            }
//
//            console.log(result)
//            google.charts.load('current', {
//                'packages': ['corechart'],
//                // Note: you will need to get a mapsApiKey for your project.
//                // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
//                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
//            });
//            google.charts.setOnLoadCallback(drawChart);
//
//            function drawChart() {
//                var data = google.visualization.arrayToDataTable(result);
//
//                var chart = new google.visualization.LineChart(document.getElementById('barchart'));
//
//                chart.draw(data, options);
//            }
//
//
//        }


        function CreateLineChart(data) {
        var chartdatum = data;
        var source1 = chartdatum.source;
        google.charts.load('current', {
        'packages': ['corechart']
    });
         google.charts.setOnLoadCallback(drawChart);

                   var result = [];
                   final_json =[];
                   var new_key = Object.keys(chartdatum.source[0].values);
                   new_key.sort();
                   new_key.unshift("country");
                   final_json.push(new_key);
                   source1.forEach(function(Object){
                   final_json.push([Object.country,parseFloat(Object.values.Customer_MDM),parseFloat(Object.values.Email),parseFloat(Object.values.RDM),parseFloat(Object.values['Web/Clickstream/Portal'])]);

                   });
                console.log(final_json);
        function drawChart() {
        var data = google.visualization.arrayToDataTable(final_json);
            var chart = new google.visualization.LineChart(document.getElementById('barchart'));
            chart.draw(data, options);
        }
}

         function CreateSankeyChart(data) {
            var chartdatum = data;
           /* var result = [];
            result.push(Object.keys(chartdatum.source[0]));
                for (var i in chartdatum.source) {
                    chartdatum.source[i].value = parseFloat(chartdatum.source[i].value);
                    result.push(Object.values(chartdatum.source[i]));
                }*/
                google.charts.load('current', {
                'packages': ['sankey']
            });
                 google.charts.setOnLoadCallback(drawChart);

                function drawChart() {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'From');
                    data.addColumn('string', 'To');
                    data.addColumn('number', 'Weight');
                    data.addRows([
                      [ 'A', 'X', 5 ],
                      [ 'A', 'Y', 7 ],
                      [ 'A', 'Z', 6 ],
                      [ 'B', 'X', 2 ],
                      [ 'B', 'Y', 9 ],
                      [ 'B', 'Z', 4 ]
                    ]);
                    var options = {
                     width: 600,
                     };
                    var chart = new google.visualization.Sankey(document.getElementById('barchart'));
                    chart.draw(data, options);
                }
        }

        function CreateColumnChart(data) {
            var chartdatum = data;
            var result = [];
              result.push(Object.keys(chartdatum.source[0]));
                for (var i in chartdatum.source) {
                    chartdatum.source[i].value = parseFloat(chartdatum.source[i].value);
                    result.push(Object.values(chartdatum.source[i]));
                }
              google.charts.load('current', {
                'packages': ['corechart'],
                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
            });
              google.charts.setOnLoadCallback(drawChart);
                function drawChart() {
                    var data = google.visualization.arrayToDataTable(result);
                    var chart = new google.visualization.ColumnChart(document.getElementById('barchart'));
                    chart.draw(data, options);
                }
        }

        function CreateComboChart(data) {
            var chartdatum = data;
            var result = [];
            result.push(Object.keys(chartdatum.source[0]));
                for (var i in chartdatum.source) {
                    chartdatum.source[i].value = parseFloat(chartdatum.source[i].value);
                    result.push(Object.values(chartdatum.source[i]));
                }
            google.charts.load('current', {
                'packages': ['corechart'],
                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
            });
            google.charts.setOnLoadCallback(drawChart);

                function drawChart() {
                    var data = google.visualization.arrayToDataTable(result);
                    var chart = new google.visualization.ComboChart(document.getElementById('barchart'));
                    chart.draw(data, options);
                }
        }
    });
});

    function loadVoices() {
      var voices = speechSynthesis.getVoices();
    // Loop through each of the voices.
      $('.input-field select').html("");
      voices.forEach(function(voice, i) {
        // Create a new option element.
        if (voice.lang == 'en-US') {
            $('.input-field select').append($('<option>', {
                value: voice.lang,
                text: voice.name
            }));
        }
     });
     $('select').material_select(function() {
        record = recordarray.pop();
     });
    }

    var recognition;
    nlp = window.nlp_compromise;
    var accessToken = "07d9287b2ad24e3984a1f1f49fe172bf";
    var baseUrl = "https://api.dialogflow.com/v1/";
    var messages = [], //array that hold the record of each string in chat
        lastUserMessage = "", //keeps track of the most recent input string from the user
        botMessage = "", //var keeps track of what the chatbot is going to say
        botName = 'Mia'; //name of the chatbot

    function startRecognition() {
      recognition = new webkitSpeechRecognition();
      recognition.onstart = function(event) {
      updateRec();
      };
      recognition.onresult = function(event) {
        var text = "";
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
        }
        setInput(text);
        stopRecognition();
    };
      recognition.lang = "en-US";
      recognition.start();
    }

    function stopRecognition() {
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
        updateRec();
    }

    function switchRecognition() {
        if (recognition) {
            stopRecognition();
        } else {
            startRecognition();
        }
    }

    function setInput(text) {
        $("#chatbox").val(text);
        newEntry();
    }

    function updateRec() {
        image_url = (recognition ? "mic" : "mic_off");
        $("#rec .small")[0].innerText = image_url;
    }

    function send() {
        var text = lastUserMessage;
        $.ajax({
            type: "POST",
            url: baseUrl + "query?v=20170712",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            data: JSON.stringify({
                query: text,
                lang: "en",
                sessionId: "241187"
            }),

            success: function(data) {
                setResponse(JSON.stringify(data, undefined, 2));
                setAudioResponse(data);
                dataresult = data;
            },
            error: function() {
                setResponse("Internal Server Error");
            }
        });
        setResponse("Loading...");
    }

    function setResponse(val) {
        $("#response").text(val);
    }

    function setAudioResponse(val, record) {
        if (val.result) {
            var say = "";
            say = val.result.fulfillment.messages;
            for (var j = 0; j < say.length; j++) {
                botMessage = say[j].speech;
                messages.push("<b>" + botName + ":</b> " + botMessage);
                    for (var i = 1; i < 11; i++) {
                        if (messages[messages.length - i])
                            $("#chatlog" + i).html(messages[messages.length - i]);
                    }
                synth = window.speechSynthesis;
                var utterThis = new SpeechSynthesisUtterance(botMessage);
                //	utterThis.lang = $("#voiceSelect option:selected").val();
                    if (!record) {
                        if ($("ul li.active span")[0] == undefined) {
                            record = $("ul li span")[0].innerHTML;
                            recordarray.push(record);
                        } else {
                            record = $("ul li.active span")[0].innerHTML;
                            recordarray.push(record);
                        }
                    }

                var counter = $("select option");
                $.map(counter, function(data) {
                    if (record == $(data)[0].innerHTML) {
                        utterThis.lang = $(data)[0].value;

                        utterThis.name = $(data)[0].innerHTML;
                    }

                });

                synth.speak(utterThis);

            }
        }
    }

/*this runs each time enter is pressed. It controls the overall input and output*/
    function newEntry() {
        if ($("#chatbox").val() != "") {
            //pulls the value from the chatbox ands sets it to lastUserMessageS
            lastUserMessage = $("#chatbox").val();
            //sets the chat box to be clear
            $("#chatbox").val("");
            //adds the value of the chatbox to the array messages
            messages.push("<b>Me: </b>" + lastUserMessage);
            //Speech(lastUserMessage);  //says what the user typed outloud
            //sets the variable botMessage in response to lastUserMessage
            send();
            // botMessage = '';
            //add the chatbot's name and message to the array messages
            //messages.push("<b>" + botName + ":</b> " + botMessage);
            // says the message using the text to speech function written below
            //outputs the last few array elements of messages to html
            for (var i = 1; i < 11; i++) {
                if (messages[messages.length - i])
                    $("#chatlog" + i).html(messages[messages.length - i]);
            }
        }
    }