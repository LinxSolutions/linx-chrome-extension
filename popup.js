var BASE_URL = 'https://28905a73.ngrok.io';

var loadingScene = document.getElementById('loading');
var loginScene = document.getElementById('login');
var loggedInScene = document.getElementById('loggedIn');
var lessonScene = document.getElementById('lesson');

var header = document.getElementById('header');
var status = document.getElementById('status');

var user = {};

var media_loaded = false;
var lessons_loaded = false;



function isAuthenticated() {
    chrome.storage.sync.get("user", function (resp) {
        if(user !== null && !$.isEmptyObject(resp)){
            user = resp;
            showLoggedInScene();
        }
    });
    showLoginScene();
}


function authenticate(response) {
    chrome.storage.sync.set({"user": response}, function() {
       showLoggedInScene();
    });
}


function logout(){
    showLoadingScene();
    chrome.storage.sync.clear(function () {
        showLoginScene();
    });
}


function login(username, password) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(this.responseText);
            if(response.status !== "error"){
                showLoadingScene();
                authenticate(response.response);
            } else {
                showLoginScene();
                console.log(response.message);
                document.getElementById('status').innerHTML = response.message;
                document.getElementById('status').style.display = 'block';
            }
        }
    };
    xhttp.open("POST", BASE_URL+'/api/login', true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("username="+username+"&password="+password);
}


function showLoggedInScene() {
    header.style.display = 'none';
    loadingScene.style.display = 'none';
    loginScene.style.display = 'none';
    loggedInScene.style.display = 'block';
    lessonScene.style.display = 'none';

    if(!lessons_loaded){
        getLessions();
    }


    $("#logoutBtn").click(function () {
        logout();
    });


    $('#sampleBtn2').click(function () {
        showLessonScene();
    });

    lessons_loaded = false;

}






function buildQuiz() {

}


function showQuiz(quiz) {
    
}


function showLessonScene(lesson) {
    header.style.display = 'none';
    loadingScene.style.display = 'none';
    loginScene.style.display = 'none';
    loggedInScene.style.display = 'none';
    lessonScene.style.display = 'block';

    document.getElementById('lessonTitle').innerHTML = lesson.name;
    document.getElementById('lessonProgress').innerHTML = '<center> <div class="chart" id="graph" data-percent="'+lesson.progress+'"></div> </center>';
    loadProgress('graph', 100);

    getLessonMedia(lesson);

    $('#backBtn').click(function () {
        showLoggedInScene();
    });

    media_loaded = false;
}



function getLessonMedia(lesson){
    // showLoadingScene();

    // var xhttp = new XMLHttpRequest();
    // xhttp.onreadystatechange = function() {
    //     if (this.readyState === 4 && this.status === 200) {
    //         var response = JSON.parse(this.responseText);
    //         if(response.status == "success"){
    //
    //             var media = response.response;
                var media = lesson.media;

                console.log(media);

                for(var i=0; i<media.length; i++){

                    var id = makeid();

                    var c = 'is-grey';

                    if(media[i].isViewed){
                        c = 'is-green';
                    }

                    document.getElementById('lessonMedia').innerHTML += '<article class="media list-item"> <figure class="media-left"> <p class="image is-48x48"> <img src="'+media[i].image+'"> </p> </figure> <div class="media-content"> <div class="content"> <div class="media-title">'+media[i].title+'</div> <div class="media-type">'+media[i].type+'</div> <div class="btn-group"> <a id="'+id+'WatchBtn" class="button is-small is-green">WATCH</a> <a id="'+id+'TestBtn" class="button is-small is-blue">TEST</a> </div> </div> </div> <div class="media-right"> <div class="'+c+' is-fullheight"> <span class="icon"> <i class="fa fa-check-square-o"></i> </span> </div> </div> </article>';

                    $('#' + id + 'WatchBtn').click({m: media[i]}, function (event) {
                        chrome.tabs.create({url: event.data.m.url}, function (tab) {
                            console.log("new tab launched");
                        });
                    });


                    $('#' + id + 'TestBtn').click({m: media[i]}, function (event) {
                        startQuiz(event.data.m)
                    });

                }
    //
    //
    //         } else {
    //             console.log(response.message);
    //         }
    //
    //         media_loaded = true;
    //         showLessonScene(lesson);
    //     }
    // };
    // xhttp.open("POST", BASE_URL+'/api/media', true);
    // xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // xhttp.send("username="+user.username+"&lesson_id="+lesson.lesson_id);
}




function showLoginScene(){
    header.style.display = 'flex';
    loadingScene.style.display = 'none';
    loginScene.style.display = 'block';
    loggedInScene.style.display = 'none';
    lessonScene.style.display = 'none';

    $("#loginSigninBtn").click(function () {
        var username = document.getElementById('loginUsername').value;
        var password = document.getElementById('loginPassword').value;

        showLoadingScene();

        login(username, password);
    });

}

function showLoadingScene() {
    header.style.display = 'none';
    loadingScene.style.display = 'block';
    loginScene.style.display = 'none';
    loggedInScene.style.display = 'none';
    lessonScene.style.display = 'none';
}



function loadProgress(progressID, width){
    var el = document.getElementById(progressID); // get canvas

    var options = {
        percent:  el.getAttribute('data-percent') || 25,
        size: el.getAttribute('data-size') || width,
        lineWidth: el.getAttribute('data-line') || 3,
        rotate: el.getAttribute('data-rotate') || 0
    };

    var canvas = document.createElement('canvas');
    canvas.className = 'chartCircle';
    var span = document.createElement('span');
    span.className = 'chartText';
    span.textContent = options.percent + '%';

    if (typeof(G_vmlCanvasManager) !== 'undefined') {
        G_vmlCanvasManager.initElement(canvas);
    }

    var ctx = canvas.getContext('2d');
    canvas.width = canvas.height = options.size;

    el.appendChild(span);
    el.appendChild(canvas);

    ctx.translate(options.size / 2, options.size / 2); // change center
    ctx.rotate((-1 / 2 + options.rotate / 180) * Math.PI); // rotate -90 deg

    //imd = ctx.getImageData(0, 0, 240, 240);
    var radius = (options.size - options.lineWidth) / 2;


    var drawCircle = function(color, lineWidth, percent) {
        percent = Math.min(Math.max(0, percent || 1), 1);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2 * percent, false);
        ctx.strokeStyle = color;
        ctx.lineCap = 'round'; // butt, round or square
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    };


    drawCircle('#efefef', options.lineWidth, 100 / 100);

    if(options.percent != 0){
        var i = 0;
        var int = setInterval(function(){
            i++;
            drawCircle('#C86F08', options.lineWidth, i / 100);
            span.textContent=i+"%";
            if(i>= options.percent) {
                clearInterval(int);
            }
        }, 15);
    }


}




function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}




function getLessions() {
    showLoadingScene();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(this.responseText);
            if(response.status == "success"){
                var lessons = response.response;

                document.getElementById('lessons').style.width = lessons.length*170 + "px";

                var p = [];

                var invalid = 0;

                for(var i=0; i<lessons.length; i++){
                    var lesson = lessons[i];
                    var questions = lesson.questions;
                    var correct = 0;
                    var incorrect = 0;
                    for(var j=0; j<questions.length; j++){
                        if(questions[j].results != null){

                            correct += questions[j].results.correct;
                            incorrect += questions[j].results.incorrect;
                        } else {
                            questions[j].results = {
                                correct: 0,
                                incorrect: 0
                            }
                        }
                    }



                    if(correct+incorrect == 0){
                        lesson.progress = 0;
                    } else {
                        lesson.progress = Math.round(correct / (correct+incorrect));
                    }

                    if(lesson.progress < 50){
                        invalid++;
                    }


                    var disabled = '';

                    if(invalid > 3){
                        disabled = 'disabled';
                    }


                    var id = makeid();

                    document.getElementById('lessons').innerHTML += '<div class="box lesson has-text-centered is-pulled-left"> <h6 class="title is-6">'+lesson.name+'</h6> <div class="progress"> <center> <div class="chart" id="'+id+'Graph" data-percent="'+lesson.progress+'"></div> </center> </div> <a id="'+id+'" class="button is-small is-dark is-fullwidth" data-disabled="'+disabled+'" '+disabled+'>View Media</a> </div>';

                    p.push({"id": id, "lesson": lesson});


                }



                for(var j=0; j<p.length; j++){
                    loadProgress(p[j].id+'Graph', 70);

                    if($('#'+p[j].id).data('disabled') != 'disabled') {

                        $('#' + p[j].id).click({lesson: p[j].lesson}, function (event) {
                            document.getElementById('lessons').innerHTML = "";
                            showLessonScene(event.data.lesson);
                        });
                    }

                }

            } else {
                console.log(response.message);
            }

            lessons_loaded = true;
            showLoggedInScene();

        }
    };
    xhttp.open("POST", BASE_URL+'/api/lessons', true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("username="+user.user.username+"&language_id="+1);
}




document.addEventListener('DOMContentLoaded', function() {
    showLoadingScene();
    isAuthenticated();
});