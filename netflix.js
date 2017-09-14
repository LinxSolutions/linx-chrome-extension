var url = 'https://28905a73.ngrok.io/api';

var capture_mode = false;

var captions_sent = false;

var current_text = "";

var is_enabled = true;
var quiz_displayed = false;

var current_captions = {
    "title": getCurrentTitle(),
    "subtitle": getCurrentSubtitle(),
    "captions": [],
    "questions": []
};

var loaded = false;

var wordsList = [];

var words = [];

var user = null;


document.getElementsByTagName('head')[0].innerHTML += '<style> .quiz-container { display:block; position: fixed; top:0; left:0; right:0; bottom:0; background: rgb(0, 0, 0); background: rgba(0, 0, 0, 0.5); z-index:9999; } .doneBtn { background-color: #eeeeee; text-align:center; padding:24px; font-weight:bold; font-size:24px; cursor:pointer; color:#999999; position:absolute; bottom:16px; left:16px; right:16px; } .quiz-modal { position: absolute; width: 640px; height: 640px; background-color: #ffffff; padding:16px; left:50%; top:50%; margin-left:-320px; margin-top:-320px; text-align:center; } .close-btn { position: absolute; right: 10px; top:10px; color:#999999; font-weight: bold; font-family: Verdana; cursor: pointer; } .quizSection{ display:block; margin-top:16px; margin-bottom:16px; } .questions { color:#242424; } .question { color:#242424; } .questionBtns { margin-left:16px; } .btn { text-decoration: none; color: #ffffff; background-color: #999999; padding:16px; margin:8px; width:40%; display:block; float:left; border-radius:4px; } </style>';
document.getElementsByTagName('body')[0].innerHTML = '<div id="quizModal" class="quiz-container"> <div class="quiz-modal"> <div id="closeBtn" class="close-btn">X</div> <div id="questions"></div> <div id="doneBtn" class="doneBtn">DONE</div> </div> </div> </div>' + document.getElementsByTagName('body')[0].innerHTML;



$('#closeBtn').click(function () {
    document.getElementById('quizModal').style.display = 'none';
    quiz_displayed = false;
    play_video();
});

$('#doneBtn').click(function () {
    document.getElementById('quizModal').style.display = 'none';
    quiz_displayed = false;
    play_video();
});


function getCurrentTitle() {
    var t = document.getElementsByClassName('player-status-main-title')[0];
    if(t != null){
        return t.textContent;
    } else {
        return null;
    }
}




function getCurrentSubtitle() {
    var spans = document.getElementsByClassName('player-status')[0];
    if(spans != null){
        return spans.textContent.replace(getCurrentTitle(), "");
    } else {
        return null;
    }
}


function getTime(){
    return document.getElementsByClassName('player-slider')[0].getElementsByTagName('label')[0].textContent;
}



function get_current_text() {
    var texts = document.getElementsByClassName('player-timedtext-text-container')[0];
    if (texts != null) {
        return texts.getElementsByTagName('span')[0].innerHTML.replace(/<(?:.|\n)*?>/gm, '');
    } else {
        return current_text;
    }
}


function pause_video() {
    var video = document.getElementsByTagName('video')[0];
    if(video != null){
        video.pause();
    }
}


function play_video() {
    var video = document.getElementsByTagName('video')[0];
    if(video != null){
        video.play();
    }
}



function video_ended() {
    var d = document.getElementsByClassName('video-ended')[0];
    return (d != null);
}



function sendCaptions() {
    captions_sent = true;
    pause_video();


    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var j = JSON.parse(this.responseText);
            if(j.status == 'success'){
                current_captions = {
                    "title": null,
                    "subtitle": null,
                    "captions": []
                };

                console.log(j.response);
            } else {
                console.log(j.message);
            }

            captions_sent = false;
            play_video();
        }
    };
    xhttp.open("POST", url+'/scrap', true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("captions="+JSON.stringify(current_captions));
}



if(capture_mode) {
    setInterval(function () {
        text = get_current_text();
        if (text != current_text) {
            current_text = text;

            if (current_captions.title == null) {
                current_captions.title = getCurrentTitle();
            }

            if (current_captions.subtitle == null) {
                current_captions.subtitle = getCurrentSubtitle();
            }

            var caption = {
                "text": current_text,
                "time": getTime()
            };

            current_captions.captions.push(caption);

            console.log(current_captions);
        }
    }, 500);


    setInterval(function () {

        if (video_ended()) {
            if (!captions_sent) {
                sendCaptions();
            }
        }

    }, 500);
}
















function getCurrentLesson(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(this.responseText);
            if(response.status == "success"){
                current_captions.questions = response.response;
                console.log(current_captions.questions);
            } else {
                console.log(response.response)
            }
        }
    };
    xhttp.open("POST", url+'/lesson', true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("title="+current_captions.title+"&subtitle="+current_captions.subtitle+"&language_id="+1);
}





function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}



function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}





function add_correct(word, mark) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(this.responseText);
            if(response.status == "success"){
                console.log(response.response);
            } else {
                console.log(response.response)
            }
        }
    };
    xhttp.open("POST", url+'/progress', true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("username="+user.username+"&lesson_id="+word.lesson_id+"&question_id="+word.question_id+"&mark="+mark+"&language_id="+1);
}





function displayQuiz() {

    if(words.length > 3) {

        var buildQuestions = '';

        shuffle(words);

        w = [words[0], words[1], words[2]];

        var ids = [];

        for (var i = 0; i < w.length; i++) {
            var btns = '';

            shuffle(words);
            var h = 0;
            var g = 1;
            var f = 2;

            while (h == i || h == g || h == f) {
                h++;
            }

            while (g == i || h == g || g == f) {
                g++;
            }

            while (f == i || f == g || h == f) {
                f++;
            }


            var ans = [w[i].word, words[h].word, words[g].word, words[f].word];

            shuffle(ans);

            for (var j = 0; j < ans.length; j++) {
                var id = makeid();
                if (ans[j] == w[i].word) {
                    ids.push({"id": id, "result": true});
                    btns += '<a id="' + id + '" class="btn">' + ans[j] + '</a>';
                } else {
                    ids.push({"id": id, "result": false});
                    btns += '<a id="' + id + '" class="btn">' + ans[j] + '</a>';
                }
            }
            buildQuestions += '<div class="quizSection"> <div class="question">What is the meaning of ' + w[i].translation + ' (' + w[i].transliteration + ')?</div> <div class="questionBtns">' + btns + '</div> </div>';
        }


        document.getElementById('questions').innerHTML = buildQuestions;


        for (var j = 0; j < ids.length; j++) {
            if (ids[j].result) {
                $('#' + ids[j].id).click(function () {
                    this.style.backgroundColor = "green";
                    add_correct(this.innerHTML, "correct");
                });
            } else {
                $('#' + ids[j].id).click(function () {
                    this.style.backgroundColor = "red";
                    add_correct(this.innerHTML, "incorrect");
                });
            }
        }

        document.getElementById('quizModal').style.display = 'block';

    }
}





function getUser(){
    chrome.storage.sync.get("user", function (resp) {
        if(user !== null && !$.isEmptyObject(resp)){
            user = resp;
        }
    });
}











function put_it_in(w) {
    html = '<span style="color:red">'+w.word+' ('+w.translation+', '+w.transliteration+')</span>';
    var builtHTML = current_text.replace(w.word, html);
    current_text = builtHTML.replace(/<(?:.|\n)*?>/gm, '');
    document.getElementsByClassName('player-timedtext-text-container')[0].getElementsByTagName('span')[0].innerHTML = builtHTML;
}




if(is_enabled) {
    setInterval(function () {
        text = get_current_text();
        if (text != current_text) {
            current_text = text;

            if (current_captions.title == null || current_captions.subtitle == null) {
                current_captions.title = getCurrentTitle();
                current_captions.subtitle = getCurrentSubtitle();
            } else {
                if (!loaded) {
                    loaded = true;
                    getCurrentLesson();
                } else {
                    if(current_captions.questions.length != 0){

                        console.log(current_text);

                        for(var j=0; j<current_captions.questions.length; j++){

                            w = current_text.split(" ");
                            for (var i = 0; i < w.length; i++) {
                                word = w[i].trim().replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "");

                                if(word.toLowerCase() == current_captions.questions[j].word.toLowerCase()){
                                    var w = {
                                        word: current_captions.questions[j].word,
                                        translation: current_captions.questions[j].translation,
                                        transliteration: current_captions.questions[j].transliteration,
                                        question_id: current_captions.questions[j].question_id,
                                        lesson_id: current_captions.questions[j].lesson_id
                                    };

                                    put_it_in(w);

                                    var exists = false;
                                    for(var k=0; k<words.length; k++){
                                        if(words[k] == w.word){
                                            exists = true;
                                            break;
                                        }
                                    }
                                    if(!exists){
                                        words.push(w);
                                    }

                                    break;
                                }
                            }


                        }





                    }
                }
            }

        }
    }, 500);


    setInterval(function () {


        if(video_ended()){
            if(!quiz_displayed){
                if(words.length > 3){
                    displayQuiz();
                    quiz_displayed = true;
                }
            } else {
                pause_video();
            }
        } else {
            if(!quiz_displayed){
                document.getElementById('quizModal').style.display = 'none';
            } else {
                pause_video();
            }
        }

    }, 500);
}