---
layout: post
title: "OSX Lion LAMP Stack Setup"
category: LAMP
tags: [LAMP, OS X, PHP, MySQL]
---
{% include JB/setup %}

Prior to upgrading to OS X Lion when I was kinda messing around with Wordpress I was using [MAMP](http://www.mamp.info/en/index.html). However, now that I have to come back to PHP (Post Lion Upgrade) the latest version of MAMP was throwing weird errors when importing scripts and creating tables and was having issues connecting to my local MySQL database. It might have just been that my default MySQL connection path was not configured properly but I decided to create a fresh LAMP stack without using MAMP. It is much more involved to setup but was a great learning experience and a refresher for how all these pieces fit together. I scoured the Internet and compiled all the different steps that I used right here.

1. Go to **System Preferences > Sharing** and check the *Web Sharing* checkbox. You can then click on one of the links or just navigate to [http://localhost/](http://localhost/).

    ![Sharing Preferences](/assets/img/sharing.jpg)

    You should see a page like this:

    ![It Works](/assets/img/works.jpeg)

2. Open up the Apache config in your favourite editor by typing `sudo vi /private/etc/apache2/httpd.conf` in the terminal (which is an alias for `/etc/apache2/httpd.conf`).

      * Enable PHP by uncommenting **line 111**:

            #LoadModule php5_module libexec/apache2/libphp5.so

      * If you want you can change the web user on **line 157**

            User [your_username]

      * If you have other projects you can also add alias':

            Alias /mySite /Users/me/Documents/workspace/mySite
            <Directory /Users/me/Documents/workspace/mySite>
              Options Indexes
              Order allow,deny
              Allow from all
            </Directory>

    If you want to configure more advanced options like SSL certificates and MySQL configuration you can refer to [this great post](http://todsul.com/lamp-mac-os-x-lion) or be straight hardcore and look at your `/private/etc/php.ini`  and `/private/etc/apache2/httpd.conf` files.

3. Create a php.ini file and configure PHP:

    * Type `sudo cp /private/etc/php.ini.default /private/etc/php.ini` in your terminal
    * You might also want to add your time zone to the php.ini file

4. Type `sudo apachectl restart` in the command line or go to your preferences and toggle *Web Sharing* off and then on again.
5. [Download MySQL](http://www.mysql.com/downloads/mysql/) and just install it via the package installer. I use the 64-bit version. I also recommend installing the startup utility and the preference pane.
6. **Restart your computer** - MySQL didn't work properly without this step.
7. Check to make sure that MySQL is turned on. If you installed the preference pane you can check it there.

    ![Preference Pane](/assets/img/preferences.jpg)

8. Get [Sequel Pro](http://www.sequelpro.com/)
    - **Note** In order to log in to MySQL for the first time your username should be **root** and there is no password.
9. Install phpMyAdmin using [this guide](http://www.djangoapp.com/blog/2011/07/24/installing-phpmyadmin-on-mac-os-x-lion/). Start from **step 4** as we have already completed the previous steps.

That's it now you should be done.
<hr>
### Credits ###
All of these sources were used in some fashion:

* [http://brettu.com/education-wordpress-development-environment-setup-without-mamp-on-osx-lion/](http://brettu.com/education-wordpress-development-environment-setup-without-mamp-on-osx-lion/)
* [http://todsul.com/lamp-mac-os-x-lion](http://todsul.com/lamp-mac-os-x-lion)
* [http://www.djangoapp.com/blog/2011/07/24/installing-phpmyadmin-on-mac-os-x-lion/](http://www.djangoapp.com/blog/2011/07/24/installing-phpmyadmin-on-mac-os-x-lion/)
* [Where are MySQL's Files?](http://www.sequelpro.com/docs/Where_are_MySQL's_Files%3F)
* [XDebug on OSX](http://johnmclaughlin.info/blog/getting-php-xdebug-working-again-on-mac-os-x-10-7-lion/)
*wo [Sublime Text 2 - XDebug](https://github.com/Kindari/SublimeXdebug)
    - **Note** You need to create a `.sublime-project` file and then put in the project URL for x-debug to look at. Like [here](https://github.com/Kindari/SublimeXdebug#session-based-debugging).