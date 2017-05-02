# covering_arrays

## Dependencies:

-nodeJS <br />
  Check if nodeJS is installed by typing "node -v" in console.  If node is not installed you can install it by going to: https://nodejs.org/en/download/  Node may also be available in your package manager. <br />
-npm<br />
  Verify that npm is installed by typing "npm -v".  Normally npm is installed with node, if it was not you can go to: https://docs.npmjs.com/getting-started/installing-node <br />
-git <br />
  Check if git is installed by typing "git --version". If git is not installed you can download it from: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git   Git may also be available in your package manager. <br />

## To install the website: <br />
  1: Clone this repository:  "git clone https://github.com/bicole/covering_arrays.git" <br />
  2: Cd into the newly created folder "cd covering_arrays" <br />
  3: Download node packages by typing "npm install". This process can take a few minutes <br />
  4: Start the node server with: "npm start" <br />
  5: Open a web browser and navigate to: "http://localhost:5000" <br />

## To install MySql Server: <br />
-There are different ways to install mysql based on the type of operating system you are using.  You can go to https://dev.mysql.com/doc/refman/5.7/en/installing.html to learn the best way to install mysql server on your system.  We used mysql version: 5.5.46 you should be okay to install a newer version. <br />
-Once you have mysql server installed you can go to "covering_arrays/MySqlDump/schema.sql" to view an exported schema that shows how the database tables should be configured.  If you are using mysql workbench OR other importing tool you can import this file into your mysql server. <br />

## To setup amazon s3 file storage: <br />
  1: You will need an amazon account with amazon web services (aws) enabled.  If you have an existing amazon account you can use it, if not signup for a new amazon account. <br />
  2: Once you have an aws account navigate to https://console.aws.amazon.com/console/ You are now on the aws console. <br />
  3: You can find the link to S3 on this page, or you can search for S3 in the "AWS services" text box. <br />
  4: On the S3 page click "Create bucket" <br />
  5: Assign the bucket a name. You can call it whatever you want, you will enter this name into a config file later. <br />


## Configuration: <br />
-You can change the port that the server listens on by setting the environment variable PORT or by editing "covering_arrays/server.js". The variable is called "serverPort". <br />

-You will need to change the database config to match your mysql server.  The website uses "covering_arrays/config/database.js" as the config file for this. <br />

-You will need to change the amazon web services S3 credentials.  These can be found in: "covering_arrays/app/s3Ops.js"  The main ones you will need to change are: "S3_BUCKET" this is the bucket name, "accessKeyId" and "secretAccessKey" are both security credentials that can be found by clicking your name in the upper right of the aws console  https://console.aws.amazon.com/console/ and selecting "My security credentials". If you do not already have them you will need to create them. <br />

-You can change the maximum file size that a user can upload with the "maxFileSizeInBytes" variable in "covering_arrays/app/s3Ops.js". It is curretnly set to 500mb. <br />
