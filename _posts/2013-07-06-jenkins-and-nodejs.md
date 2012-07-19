---
layout: post
title: "Jenkins and NodeJS"
category: Continuous Integration
tags: [Jenkins, NodeJS]
---
{% include JB/setup %}

We are using [Jenkins](http://jenkins-ci.org/) Continuous Integration Server to manage our automated build process.  We have hooks into github, email, IRC (and in the future twitter) to notify of builds, deployments, build errors, and failed tests.

## Configuration ##
First you need to start by installing Jenkins.  Jenkins doesn't come with ubuntu by default so you need to run this from the command line:

```
wget -q -O - http://pkg.jenkins-ci.org/debian/jenkins-ci.org.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins-ci.org/debian binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo aptitude update
sudo aptitude install jenkins
```

Now Jenkins will be launched as a daemon on start. See /etc/init.d/jenkins for more details. The 'jenkins' user is created to run this service. A log file will be placed in /var/log/jenkins/jenkins.log. If Jenkins is not running type:

```
sudo /etc/init.d/jenkins restart
```
By now, Jenkins will be listening on port 8080. Go to http://72.29.238.208:8080/ to view the Jenkins dashboard. From there you can follow [this](http://fourkitchens.com/blog/2011/09/20/trigger-jenkins-builds-pushing-github#comment-569) tutorial.  We want to have the IRC, Git, Github, Github Authentication plugins installed as well as Ant. 

#### Setting up OAuth ####
* An OAuth application for Github has been created. You can find the information [here](https://github.com/account/applications) when logged in as willfred on Github. Alternatively here is the info that will need to be put in the Jenkins configuration:
   * Client ID: 1b85556564bc90f04724
   * Client Secret: 125c74b375febaab758503bedfe5bdad9e23ee72

## Gotchas ##
* The "Github project" value is https://github.com/CORTxT/MMC_Linux/
* The "Repository URL" is git@github.com:CORTxT/MMC_Linux.git
* We want to have two branches that Jenkins is listening to: "dev" & "master"
* Since we are using the Github OAuth plugin you need to create a public key in ```/var/lib/jenkins/.ssh```. This key should be the same key as our bot willfred's on Github.
* Another trick is if you are getting an error about Jenkins not being able to run ```git --version```, it is because the project was created before git was properly installed.  You need to recreate the project and it should work.
* For CORTxT when setting up the "Post-Receive URL" service hook for Jenkins the URL is http://72.29.238.208:8080/github-webhook/ because we are not using SSL currently and it appears that we don't need to provide a login (I'm assuming due to the Github OAuth Plugin).

