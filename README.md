# MendixDeployBot

SETUP REQUIRED

step 1:

Install Node on your computer: https://nodejs.org/en/download/

step 2:

Open CMD (windows) or Terminal (Mac) and go to the folder of the mendixdeploybot.
example 'cd desktop/programming/mendixdeploybot

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

You can run the script from the commandline from the directory where the index.js file is located.
The file uses two extra parameters [appname] and [branchename] so the command will look like this:

(..)/mendixdeploybot$ node index.js [appname] [branchename]

please note that the appname nor branchename can have spaces inbetween, because else those separate words of the branche or appname will be 
interpreted as separate parameters. So instead of a ' ' you have to type a '>'. So 'my branche name' needs to be typed as 'my>brance>name'.




PERSONAL SETTINGS (and in case of errors, read this)

1. In the root directory you can find a file called 'globalvariables.json'. In this file a couple of attributes are defined. A couple of variables
define the timeoutlength (wait untill a certain element appears on the page before trowing an error). If you experience any errors while running the script,
try making these numbers bigger. The sprinter environment sometimes loads slow so a timeout could happen.
2. by default it deploys to the acceptance environment. if you want to deploy to the 'test' or 'production' environment you can change the 'environment' attribute's value. 
3. by default the script opens a browser so you can see what happens exactly. If you don't want this to happen you can change the 'showProcesInBrowser' attribute to false.
4. if your appname by default uses the '>' character then you need to define another 'charToReplaceSpace'. You can do this overhere aswell.




LIMITATIONS & KNOWN BUGS

1. If the sprinter environment itself encountered an error (like: "there was an error restarting the app") This wil not be handled. Since this should not occur 99% of the time.
2. After uploading a package, the sprinter environment sometimes fails to refresh so it could timeout on finding the 'deploy' button.
 
 
