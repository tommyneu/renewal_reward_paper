let keyTimings = []

//this is when the key is pressed down in the password field
document.getElementById("password").addEventListener("keydown", (e) => {

    //if they press enter we want to not log it in our system but submit the form
    if(e.code == "Enter"){

        //prevents the user from normally submitting the form
        e.preventDefault()

        //we do our own custom submit form
        submitForm()
        return
    }

    //if it is the starting keystroke then it will make the flag time 0
    let prevDownTime = keyTimings[keyTimings.length-1]?.downTime
    if(!prevDownTime){
        prevDownTime = e.timeStamp
    }

    //pushes the data into the array
    keyTimings.push({
                    "key": e.code,
                    "holdTime": -1,   //<-- this is set to -1 since we do not know yet when they lift it up
                    "flagTime": e.timeStamp - prevDownTime,
                    "downTime": e.timeStamp
                    })

    //console.log what is happening for debugging
    console.log(e.code, "Down", e.timeStamp)
})


//this is when the key is let go in the password field
document.getElementById("password").addEventListener("keyup", (e) => {

    //loops through the array to find the matching key up
    for(let i = 0; i < keyTimings.length; i++){
        if(keyTimings[i].key == e.code && keyTimings[i].holdTime == -1){

            //hold time is calculated from the key up time minus the key down time
            keyTimings[i].holdTime = e.timeStamp - keyTimings[i].downTime
            break
        }
    }


    //console.log what is happening for debugging
    console.log(e.code, "Up", e.timeStamp)
})

//lets us set up the values before submitting
document.getElementById("submitButton").addEventListener("click", () => {
    submitForm()
})

function submitForm(){

    //sets the hidden input's values
    document.getElementById("data").value = JSON.stringify( keyTimings )

    //submits the form
    document.getElementById("passwordForm").submit()
}

document.getElementById("resetButton").addEventListener("click", (e) => {
    console.clear()
    keyTimings = []
    document.getElementById("password").value = "";
})