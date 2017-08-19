var BASE_URL = 'https://69b7552a.ngrok.io';

var loadingScene = document.getElementById('loading');
var loginScene = document.getElementById('login');
var loggedInScene = document.getElementById('loggedIn');
var header = document.getElementById('header');
var status = document.getElementById('status');

var user = {};

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
                status.innerHTML = response.message;
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

    $("#logoutBtn").click(function () {
        logout();
    });
}

function showLoginScene(){
    header.style.display = 'flex';
    loadingScene.style.display = 'none';
    loginScene.style.display = 'block';
    loggedInScene.style.display = 'none';


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
}


document.addEventListener('DOMContentLoaded', function() {
    showLoadingScene();
    isAuthenticated();
});