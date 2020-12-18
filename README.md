# MendixDeployBot

SETUP REQUIRED

step 1:

Install Node on your computer: https://nodejs.org/en/download/

step 2:

Open CMD (windows) or Terminal (Mac) and go to the folder of the deploybot.
example 'cd desktop/programming/deploybot

step 3:

make the project ready for use with npm. Type: 'npm init'
hit enter multiple times (6 or 7 times) untill you see a dollar sign again $

step 4:

install puppeteer, this is a prebuilt module the script uses to navigate throug a webpage.
type 'npm install puppeteer' 

step 5:
in de root folder create a file called 'credentials.json' and paste the following json in there:

{
    "username": "username",
    "password": "password"
}

Put your mendix sprinter credentials in there. this will be used to login to your mendix sprintr environment sothat 
the script can select your app to deploy. 




RUN THE PROGRAM

you can run the program from the commandline from the directory where the index.js file is located.
The file uses two extra parameters [appname] and [branchename] so the command will look like this:

(..)/deploybot$ node index.js [appname] [branchename]

please note that the appname nor branchename can have spaces inbetween, because else those separate words of the branche or appname will be 
interpreted as separate parameters. So instead of a ' ' you have to type a '_'. So 'my branche name' needs to be typed as 'my_brance_name'



HAVING ERRORS?

The first 8 lines on the index.js file contain a couple of constants which you can adjust. These mostly define howlong a timeout should take 
(how long it needs to wait for a certain value on the page to appear, before an error is thrown). The sprinter environment is not really known
for its great responsiveness, so try to make these values a bit bigger. Also if you think everything works to slow, you can also make these values
smaller. 


OTHER SETTINGS:

By default it deploys to the 'acceptance' environment, this can be changed to 'test' or 'production' with the const 'environment' on line 8 in the index.js file.
Note that if production has google autenticator, this script will not work. 
By default a chromium browser will open so you can look at whats happening. You can change this by setting the const 'showProcesInBrowser' \
const to false on line 7 in the index.js file

 
