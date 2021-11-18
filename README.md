# Setting Up
After installing node you will need to run **npm install** to install all the node modules
    Node modules are not included in the git since they take up a lot of space on the computer

If you are working on the file app.js for testing we can run **npm run dev**
    this will restart the server on every save

If you are not working on the files and just want to run the server you can run **npm run start** to start it
    if you make any changes to the app.js they will not show up until after the server is restarted

After the server is running you can access it in the browser at http://localhost:3000
    3000 is a variable called `PORT` in the app.js and can be changed if 3000 does not work on the machine

To stop the server `ctrl+c` can be used to terminate it 


# How it works
Using normal distribution, we can find timings that have a very low probability of being from the same person
    we can use the data point's z-score to calculate a reward which we then can total up to see if the person's typing matches or not


# Known Issues
There is an issue with backspace, if it is pressed then we will abort the validate and data entry
    even though the ending passwords are the same the keystrokes will differ
    this is also the case with a shift key being pressed for too long, or pressed and released

Having slight inconsistencies with the password can make it harder to get in every time
    we can type the password in more to the account set up page but then it also makes it less secure

Shorter than average keystrokes are weighted the same as longer keystrokes
    not sure if these should be split and we can reward them differently


# graphing success

Y is the failure rate
x is the number of characters in password

baseline old system of someone who has their password


# abstract
we have a problem and it si very important
we have a technique for fixing this problem
though our evaluation and emulation we have proven that our method is great