---
layout: post
title: "My Git Branching Strategy"
category: 
tags: [Git, Philosophy]
---
{% include JB/setup %}

I have been working with Git for the last couple years and I have tried a few different project management strategies, some of which are simplistic and others that are pretty involved. Lately, the branching strategy I have been using has been **geared towards small teams** and we have had pretty good success, as it allows us to rapidly deploy and patch. I will describe what I have been doing lately but the branching strategy is heavily influenced by [this article](http://nvie.com/posts/a-successful-git-branching-model/).

## Branching Strategy Overview

![Git Branching Diagram](/assets/img/git_branch_diagram.jpg)

## Branching Strategy & Branch Structure

In most of my projects now I basically have 2 persistent branches, **development** and **master**. The development branch hosts code that may or may not be very stable, typically my development branches remain quite stable because I never intentionally push code that breaks the build and since the tests (integration, acceptance, unit) are run every time a commit is made to the development branch I get immediate feedback on the build status. This development branch is the source of our "unstable builds" which are built, tested, and archived by the [Jenkins](http://jenkins-ci.org/) CI server every time a commit is made.

When the code is deemed ready for release it is branched off into a **release** branch (as explained in the above linked article) which will then undergo all the usual automated tests applied to the development branch as well as performance tests and manual tests. **Only minor bug fixes are allowed on release branches** and if there are any hot bug fixes they will be committed to the release branch and merged back into both the development and master branches. The current release branch (In above diagram Release 1) stays around for any hot fixes until a new release branch is created (Release 2).

Features are added using named **feature** branches. The specific naming convention that I follow is outlined below. These branches are created from the development branch and merged back into the development branch only.

Bug fixes are treated differently depending on the amount of time, complexity and code changed. If the complexity, time or code changes are low then the bug fix occurs right on the development branch (**These are essentially trivial fixes**). For larger more complex bug fixes, the developer creates a bug fix branch from development **on their local machine**. The bug fix is performed on this branch and then once tested, merged back into the development branch using the --no-ff option (no fast forward). Since the bug fix happens on the developers machine in the bug fix branch and then gets merged locally into development, only the development branch is pushed upstream (not the bug fix branch). The reason for this is to reduce clutter on the upstream server by not having a ton of different bug fix branches. One caveat is if the bug fix is really large or multiple people are working on it a bug fix branch will be created and pushed to the remote server.

## Naming Convention for Branches

* Feature branches: `feature_<feature name>`
* Release branches: `release_<version number>`
* Hot-fix branches: `hotfix_<issue number>_<optional name>`
* Bug-fix branches: `bugfix_<issue number>_<optional name>`


## Tagging

Pretty short and sweet. Any commit to the **master** branch also gets tagged using `> git tag -a <version number>`.

<hr>
This is the branching strategy that I have been following but I have to say lately I have become much more stoked about using [github pull requests](https://help.github.com/articles/using-pull-requests/) for collaboration on issues, issue discussion, and for code reviews as it is very very powerful. Especially in medium to large teams.