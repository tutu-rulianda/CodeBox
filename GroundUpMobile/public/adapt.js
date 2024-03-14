function preview_snapshot() {
    // freeze camera so user can preview pic
    if (!whenIsNotEmpty(document.getElementById("subjectName"))) {
        document.getElementById('pre_take_buttons').style.display = 'block';
        document.getElementById('post_take_buttons').style.display = 'none';
        document.getElementById('similarity').style.display = 'none';
        document.getElementById('similarity').textContent = '';
        document.getElementById('spinner').style.display = 'none';
        document.getElementById("subjectName").value = null;
        document.getElementById("subjectName").focus();
        return false;
    }
    Webcam.freeze();
    Webcam.set({
        width: 300,
        height: 400,
        image_format: 'jpeg',
        jpeg_quality: 90
    });

        // swap button sets
    document.getElementById('pre_take_buttons').style.display = 'none';
    document.getElementById('post_take_buttons').style.display = 'block';
    // document.getElementById('similarity').style.display = 'block';
    document.getElementById('similarity').textContent = '';
    document.getElementById('spinner').style.display = 'none';
}

function cancel_preview() {
    // cancel preview freeze and return to live camera feed
    Webcam.unfreeze();

    // swap buttons back
    document.getElementById('pre_take_buttons').style.display = 'block';
    document.getElementById('post_take_buttons').style.display = 'none';
    document.getElementById('similarity').style.display = 'none';
    document.getElementById('similarity').textContent = '';
    document.getElementById('spinner').style.display = 'none';
}

function save_photo() {
    if (!whenIsNotEmpty(document.getElementById("subjectName"))) {
        document.getElementById("subjectName").value = null;
        document.getElementById("subjectName").focus();
        return false;
    }

    // actually snap photo (from preview freeze) and display it
    document.getElementById('spinner').style.display = 'block';
    Webcam.snap( function(data_uri) {
        // display results in page
        document.getElementById("results").textContent =
            "<h3>Video Capture Result</h3>" +
            '<img class="img" style="margin-top:8px;" src="' + data_uri + '"/>';

        // swap buttons back
        document.getElementById('pre_take_buttons').style.display = 'block';
        document.getElementById('post_take_buttons').style.display = 'none';
        // srcImage = convertImageToBase64(data_uri, // console.log);
        document.getElementById("similarity").style.display = "block";
        picData = data_uri.replace('data:image/jpeg;base64,', '');
        subjectName = document.getElementById("subjectName").value;
        validateForm(subjectName, picData);
    });
}

function validateForm(subjectName, picData) {
    if (!whenIsNotEmpty(document.getElementById("subjectName"))) {
        document.getElementById("subjectName").value = null;
        document.getElementById("subjectName").focus();
        return false;
    }
    webcamRecognizeFace(subjectName, picData);
}

function webcamRecognizeFace(personName, picData) {
    document.getElementById("similarity").textContent = "";
    document.getElementById("spinner").style.display = "block";
    subjectName = String(personName).trim();
    picLoadedData = picData;
    const subject = "";
    let isEmpty = false;
    $(document).ajaxStop(function(){
    });
    var result = null;
    var settings = {
        "url": "https://vault.tuturulianda.com/api/v1/recognition/recognize?limit=1",
        "method": "POST",
        "timeout": 0,
        "headers": {
        "Content-Type": "application/json",
        "x-api-key": "c86b70e0-ba3c-44f3-823e-dd848b02ad24"
        },
        "data": JSON.stringify({
        "file": picLoadedData
        }),
    };

    $.ajax(settings).done(function (result) {
        data = JSON.stringify(result);
        // console.log(data);
        const jsonData = JSON.parse(data);
        try {
            if (jsonData.result[0].subjects[0].subject == undefined) throw console.log("Throw: Subject is undefined");
            if (jsonData.result[0].subjects[0].similarity.toFixed(2) < 0.96) {
                var subjectName = personName;
                if (!/^[a-zA-Z\s]*$/g.test(subjectName)) {
                    document.getElementById("spinner").style.display = "none";
                    swal("Invalid character(s). Face registration failed.");                                        
                    return;
                }
                var subjectName = htmlEntities(subjectName);
                ret = "";
                document.getElementById("similarity").textContent = ret;
                document.getElementById("spinner").style.display = "none";
                isEmpty = false;
                addSubjectName(subjectName);
                addSubjectBase64(subjectName, picLoadedData);
                swal("Face registration was successful.");
                return;
            }
        }
        catch(Error) {
            console.log("Error: Subject is undefined.");
            var subjectName = personName;
            // console.log(subjectName);
            return;
        }
        finally {
            const subject = jsonData.result[0].subjects[0].subject;
            const similarity = jsonData.result[0].subjects[0].similarity;
            if (jsonData.result[0].subjects[0].similarity.toFixed(2) >= 0.95)  {
                ret = 'This person is very similar with the face profile named <b>' + subject + '</b> from the database.';
                ret = ret + ' Hence, uploading this face image was denied.';
                document.getElementById("similarity").innerHTML = ret;
                document.getElementById("spinner").style.display = "none";
            }
            return;
        }
    }).fail(function(result){
        data = JSON.stringify(result);
        ret = 'No face is found in the given image.';
        document.getElementById("similarity").innerHTML = ret;
        document.getElementById("spinner").style.display = "none";
    });
}

function addSubjectName(subjectName) {
    document.getElementById("spinner").style.display = "none";
    var personName = subjectName.trim();
    $(document).ajaxStop(function(){
    });
    var result = null;
    try {
        var settings = {
            "url": "https://vault.tuturulianda.com/api/v1/recognition/subjects",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                "x-api-key": "c86b70e0-ba3c-44f3-823e-dd848b02ad24"
            },
            "data": JSON.stringify({
                "subject": personName
            }),
        };

        $.ajax(settings).done(function(result) {
            data = JSON.stringify(result);
            // console.log(data);
            const jsonData = JSON.parse(data);
            document.getElementById("spinner").style.display = "none";
            return "";
        });
    }
    catch(error) {
        ret = 'CodeBox could not register your name.';
        document.getElementById("similarity").innerHTML = ret;
        document.getElementById("spinner").style.display = "none";
        return "";
    }
}

function addSubjectBase64(subjectName, picData) {
    document.getElementById("spinner").style.display = "none";
    var subjectName = subjectName.trim();
    var personName = htmlEntities(String(subjectName));
    var picLoadedData = picData;
    $(document).ajaxStop(function(){
    });
    var result = null;
    try {
        var settings = {
            "url": "https://vault.tuturulianda.com/api/v1/recognition/faces?subject=" + personName + "&det_prob_threshold=0.9",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                "x-api-key": "c86b70e0-ba3c-44f3-823e-dd848b02ad24"
            },
            "data": JSON.stringify({
                "file": picLoadedData
            }),
        };

        $.ajax(settings).done(function(result) {
            data = JSON.stringify(result);
            const jsonData = JSON.parse(data);
            // console.log(jsonData);
            document.getElementById("spinner").style.display = "none";
            const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
            async function repeatedGreetingsLoop() {
                for (let i = 1; i <= 3; i++) {
                    await sleepNow(3);
                    console.log(`Wait #${i}`);
                }
            }
            repeatedGreetingsLoop();
            return "";
        });
    }
    catch(error) {
        ret = 'CodeBox could not register your face image profile.';
        document.getElementById("similarity").innerHTML = ret;
        document.getElementById("spinner").style.display = "none";
        return "";
    }
    document.getElementById("spinner").style.display = "none";
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function whenIsNotEmpty(field) {
    if ((field.value == '') || (field.value == null)) {
        field.focus(); // <----add this to focus
        swal("Please fill in the subject name. Do not leave it blank.");
        field.focus(); // <----add this to focus
        return false; // <-----move this in case of blank field only.
    }
    return true;
}

function sentenceSpeech(sentence) {
    var msg = new SpeechSynthesisUtterance();
    msg.volume = 1; // From 0 to 1
    msg.rate = 0.85; // From 0.1 to 10
    msg.pitch = 1; // From 0 to 2
    msg.lang = 'en';
    msg.text = sentence;
    window.speechSynthesis.speak(msg);
}

// /^[a-z\s]{0,255}$/

function notification(s) {
    // do something
    swal(s);
}
