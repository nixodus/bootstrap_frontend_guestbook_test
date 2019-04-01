
var fileToUpload = '';
var accessToken = '';

var apiURL = 'http://localhost:8000';

$(document).ready(function () {

    $("#file_input").change(function() {
        readURL(this);
    });

    $("#logoutButton").click(function() {
        logoutAction();
    });

    $("#login-form").submit(function(e){
        e.preventDefault();
        loginAction();
    });

    getGuestbookPosts();

});

function loginAction() {

    var login = $('#loginInput').val();
    var password  = $('#passwordInput').val();

    var data = '{'
        + '"grant-type" : "' + 'password' + '",'
        + '"redirect-uri" : "' + apiURL + '"';
    data += '}';


    if(login && password){

        $.ajax({
            type: 'POST',
            url: apiURL+'/createClient',
            crossDomain: true, xhrFields: { withCredentials: true },
            data: {
                'data': data
            },
            dataType: 'json',
            success: function (responseData, textStatus, jqXHR) {


                $.ajax({
                    type: 'POST',
                    url: apiURL+'/oauth/v2/token',
                    crossDomain: true, xhrFields: { withCredentials: true },
                    data: {
                        'grant_type': 'password',
                        'client_id': responseData.client_id,
                        'client_secret': responseData.client_secret,
                        'username': login,
                        'password': password
                    },
                    dataType: 'json',
                    success: function (responseData, textStatus, jqXHR) {


                        accessToken = responseData.access_token;
                        $('#loginSection').hide();
                        $('#logoutSection').show();
                        $('#addPostSection').show();
                        $("#loginOk").html('<strong>Well done!</strong> You successfully logged.');
                        $("#loginOk").fadeTo(2000, 500).slideUp(500, function(){
                            $("#loginOk").slideUp(5000);
                        });

                    },
                    error: function (responseData, textStatus, errorThrown) {

                        $("#loginError").html('<strong>Error!</strong> Login or password not correct.');
                        $("#loginError").fadeTo(2000, 500).slideUp(500, function(){
                            $("#loginError").slideUp(5000);
                        });

                    }
                });

            },
            error: function (responseData, textStatus, errorThrown) {

                $("#loginError").fadeTo(2000, 500).slideUp(500, function(){
                    $("#loginError").slideUp(5000);
                });
            }
        });

    }
}


function logoutAction() {
    accessToken = '';
    $('#loginSection').show();
    $('#logoutSection').hide();
    $('#addPostSection').hide();
}

function getGuestbookPosts() {
    $.ajax({
        type: 'GET',
        url: apiURL+'/api/guestbookposts',
        crossDomain: true, xhrFields: { withCredentials: true },
        data: {
        },
        dataType: 'json',
        success: function (responseData, textStatus, jqXHR) {

            var cell = '';

            $.each(responseData, function (k, item) {

                cell += '<div class="col-md-10 blogShort">';
                cell += '<h3>'+item.title+'</h3>';
                if(item.image){
                    cell += '<img style="float: left; margin-right: 5px;" src="'+apiURL+item.image+'";';
                    cell += 'class="pull-left img-responsive thumb margin10 img-thumbnail">';
                }
                cell += '<article>'+item.body+'</article>';

                cell += '</div>';
                cell += '<div style="clear:both"></div>';
                cell += '<hr>';
            });

            $('#postList').html(cell);


        },
        error: function (responseData, textStatus, errorThrown) {
            console.log(errorThrown)
        }
    });
}


function postGuestbookPost() {


    var title = $('#title').val();
    var body  = $('#body').val();
    var image  =   $('#file_input').val().replace(/C:\\fakepath\\/i, '');
    var fileimage  = fileToUpload;


    if(!title) {
        $("#fileError").text('Error: Title is required.');
        $("#fileError").fadeTo(2000, 500).slideUp(500, function(){
            $("#fileError").slideUp(5000);
        });
        return;
    }

    if(!body) {
        $("#fileError").text('Error: Message is required.');
        $("#fileError").fadeTo(2000, 500).slideUp(500, function(){
            $("#fileError").slideUp(5000);
        });
        return;
    }

    var data = '{'
        + '"title" : "' + title + '",'
        + '"body" : "' + body + '",'
        + '"image" : "' + image + '"';
    data += '}';


    $.ajax({
        type: 'POST',
        url: apiURL+'/api/guestbookpost',
        crossDomain: true, xhrFields: { withCredentials: true },
        data: {
            'access_token': accessToken,
            'data': data,
            'fileimage': fileimage
        },
        dataType: 'json',
        success: function (responseData, textStatus, jqXHR) {
            $('#title').val('');
            $('#body').val('');
            $('#file_input').val('');
            $('#img_preview').attr('src', '');
            fileToUpload = '';
            $('#postModal').modal('hide');


            $("#loginOk").html('<strong>Well done!</strong> Post added successfully. Your post will be activate by moderator.');
            $("#loginOk").fadeTo(2000, 500).slideUp(500, function(){
                $("#loginOk").slideUp(5000);
            });

        },
        error: function (responseData, textStatus, errorThrown) {
            console.log(errorThrown)
        }
    });
}


function readURL(input) {

    if (input.files && input.files[0]) {

//        console.log(input.files[0].name, input.files[0].type, input.files[0].size);

        if(input.files[0].size > ( 2 * 1048576 )) {
            $("#fileError").text('Error: Maximum file size is 2MB.');
            $("#fileError").fadeTo(2000, 500).slideUp(500, function(){
                $("#fileError").slideUp(5000);
            });
            return;
        }


        if(input.files[0].type == 'image/jpeg' || input.files[0].type == 'image/png'){
            var reader = new FileReader();

            reader.onload = function(e) {
                fileToUpload = e.target.result;
                $('#img_preview').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);

        }else{
            $("#fileError").text('Error: Wrong image type');
            $("#fileError").fadeTo(2000, 500).slideUp(500, function(){
                $("#fileError").slideUp(5000);
            });
            return;

        }
    }
}

