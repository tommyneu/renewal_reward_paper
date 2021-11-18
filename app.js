const path = require("path")
const express = require("express")
const volleyball = require('volleyball')
const app = express()
const PORT = 3000

//this will store the data for the password entries
let passwordSetups = []

//these values can be anything
const rewardThreshold = 1  //<-- this is how deviated the keystroke can be from the mean value for it to get a positive reward
                           //    it can never go below 0, and the greater the score the easier it will be to get a positive reward

const passThreshold = 1 //<-- this needs to be at least equal or greater than rewardThreshold but less than 2*length*rewardThreshold

//this is the password we will testing against and is just hardcoded
const password = "data"







//logs http requests in the server
app.use(volleyball)

//lets us parse through form requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//javascript
app.use("/js", express.static(path.join(__dirname, "public/js")))






//form submits
app.post("/submitForm", async (req, res) => {

    //if the passwords match
    if(password != req.body.password){
        res.json("Bad Password 🐸")
        return
    }

    //tries to validate the password and lets the user know they passed or failed
    try{
        let pass = await validatePasswordTiming(JSON.parse(req.body.data))

        if(pass){
            res.json("Password accepted 😍")
        }else{
            res.json("Password timing does not match 🤡") // <-- if they get this message then they did not match the timing enough
        }
        return

    //if there was an error it was because they had a backspace in the password entry
    }catch(e){
        res.json("Invalid Pattern 🐯")
    }
})

//this route is for setting up the account and adding that valid password attempt to the dataset
app.post("/setUpAccount", async (req, res) => {

    //if the passwords match
    if(password != req.body.password){
        res.json("Bad Password 🐸")
        return
    }

    //tries to add the data to the password set
    try{
        await addDataToPasswords(JSON.parse(req.body.data))
        console.log(passwordSetups)

        res.json(req.body)
        return
    }catch(e){
        res.json("Invalid Pattern 🐯")
    }
})





//HTML pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
})
app.get("/kyle", (req, res) => {
    res.sendFile(path.join(__dirname, "public/setup.html"))
})






//404 page
app.use((req, res) => {
    res.status(404)
    res.send("Not Found")
})

//starts the server
app.listen(PORT, (e) => {
    console.log(`Server connected to ${PORT}`)
})









//function for validating the passwords timing with the stored dataset
//we need an async function since this process takes some time todo
    //this may be fine to run just as a synchronous process but we will keep it an async one
async function validatePasswordTiming(data){

    let runningTotal = 0

    //loops through the keys strokes in the password
    for(let i = 0; i < data.length; i++){

        //backspaces are not allowed so it will fail stop the validation process
        if(data[i].key == "Backspace"){
            return Promise.reject("😭")
        }

        if(data[i].key !== passwordSetups[i].key){
            return Promise.reject("😭")
        }

        //calculates the z-score of the hold and flag times
        //z-score is how deviated the timing is from the mean, 
        //large magnitude z-score are probabilistically very low in odds for that person
        // z-score = (x - μ) / σ
        const zScoreHold = (data[i].holdTime - passwordSetups[i].meanHoldTime) / passwordSetups[i].SDHoldTime
        const zScoreFlag = (data[i].flagTime - passwordSetups[i].meanFlagTime) / passwordSetups[i].SDFlagTime

        //we then can use that z-score to find the reward of that event
        //we will take the reward threshold and subtract the absolute value of the z-score
        //so with low z-score(high probability of the correct person typing it) we will end up with a positive reward
        //a high z-score(low probability of the correct person typing it) we will end up with a negative reward
        const rewardHold = rewardThreshold - Math.abs(zScoreHold)
        let   rewardFlag = rewardThreshold - Math.abs(zScoreFlag)

        //we have to check if the reward for the flag time is not a number
        //since the first letter will have a flag time of 0 since it does not have another keystroke to go off of
        //these zeros for the first key flag time will result in a standard deviation of 0
        //we can not divide by 0
        if(isNaN(rewardFlag)){
            rewardFlag = rewardThreshold
        }

        //we then console.log for debugging
        console.log(data[i].key, rewardHold, rewardFlag)

        //we will then add the rewards to the running total
        runningTotal += rewardHold
        runningTotal += rewardFlag
    }

    //we will console.log for debugging
    console.log(runningTotal)

    //we will then return if the running total passed the pass threshold or not
    return Promise.resolve(runningTotal >= passThreshold)
}







//function for adding a new password entry timing set to the dataset
//we need an async function since this process takes some time todo
    //this may be fine to run just as a synchronous process but we will keep it an async one
async function addDataToPasswords(data){

    //we will keep a deep copy of the password data set incase something goes wrong
    let temp = [...passwordSetups]


    //TODO: validate number of keystrokes to the password, matching uppercase and specials with shifts

    //we then will loop through the keystrokes and add them to the data set
    for(let i = 0; i < data.length; i++){

        //we do not allow backspaces so we will roll back the changes with the backup
        //we will also cancel any more data entry
        if(data[i].key == "Backspace"){
            passwordSetups = temp
            return Promise.reject("😭")
        }

        //we double check if there is a keystroke for that spot
        //this is mostly useful for the first time the password has been entered
        if(passwordSetups.length == i){

            //it will push a new object into the array with the "default" values
            passwordSetups.push({
                "key": data[i].key,
                "holdTime": [data[i].holdTime],
                "flagTime": [data[i].flagTime],
                "meanHoldTime": data[i].holdTime,
                "meanFlagTime": data[i].flagTime,
                "SDHoldTime": 0,
                "SDFlagTime": 0
            })

            //it will then continue through the loop since we no longer need to enter the data for that keystroke
            continue
        }

        //if we do have a spot in the array for that keystroke we will push the values into the arrays
        passwordSetups[i].holdTime.push(data[i].holdTime)
        passwordSetups[i].flagTime.push(data[i].flagTime)

        //for a normal distribution we need a mean value and a standard deviation

        //we will then re-calculate the mean values
        //μ = ∑(x) / number of things
        passwordSetups[i].meanHoldTime = passwordSetups[i].holdTime.reduce((a,b) => a+b) / passwordSetups[i].holdTime.length
        passwordSetups[i].meanFlagTime = passwordSetups[i].flagTime.reduce((a,b) => a+b) / passwordSetups[i].flagTime.length
        
        //we will also recalculate the standard deviations
        //σ = sqrt( ∑( (x-μ)^2 ) )
        passwordSetups[i].SDHoldTime = Math.sqrt(passwordSetups[i].holdTime.map((x) =>{ return Math.pow(x - passwordSetups[i].meanHoldTime, 2)}).reduce((a,b) => a+b) / passwordSetups[i].holdTime.length)
        passwordSetups[i].SDFlagTime = Math.sqrt(passwordSetups[i].flagTime.map((x) =>{ return Math.pow(x - passwordSetups[i].meanFlagTime, 2)}).reduce((a,b) => a+b) / passwordSetups[i].flagTime.length)
    }

    //if we make it out of the loop then the data has been added to our dataset and we can return a success
    return Promise.resolve("😎")
}