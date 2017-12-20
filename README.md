# widestage
Lightweight Business Intelligence tool for reporting mongodb, postgresql, Mysql, &amp; MS sql data

To see how it works go to www.widestage.com

# Supported databases

[MongoDB](http://widestage.com/en/pages/open_source_reports_for_mongodb) 

Postgres

MySQL

MS SQL Server

Oracle (1)

Google Big Query

# Requirements

[nodejs](https://nodejs.org)

[mongodb](https://www.mongodb.org)

    mongodb is used to store the widestage metadata, you have to install it even if you are not going to explore mongodb data.

[npm](https://www.npmjs.com)

[bower](http://bower.io)

- Optional

    [forever](https://www.npmjs.com/package/forever)

    [nginx](http://nginx.org)

# Installation

Install nodejs (mandatory)

Install mongodb (mandatory)
    
    mongodb can be installed in a different server, if so, configure the connection in the /server/config.js production environment.

Install npm (mandatory)

Install bower (mandatory)

Install forever (optional)

clone the github repository
    
    git clone https://github.com/widestage/widestage.git

get into the widestage folder

download and install the npm libraries
    
    npm install

download and install the bower libraries
be sure you choose the angular 1.5.5 when pointed to choose otherwise it will install 1.6.4 and widestage is not compatible with that version yet, also to be sure you can run  bower install angular#1.5.5 --save
    
    bower install


# Oracle connections

If you are going to use oracle connections, first you need to install in your server the Oracle instant client and then run:

    npm install oracledb 

( [more info](https://github.com/oracle/node-oracledb) )


# Starting up the widestage server
    
    node server.js

    if you downloaded the forever package run:
        forever start "your_path_to_widestage/server.js"

    to see if is running:
        forever list

point your browser to your ip/server name

enter the credentials
    
    user name: administrator
    
    password: widestage

enjoy!!!


License GPL 3.0
https://opensource.org/licenses/GPL-3.0

