---
layout: post
title: "A Philisophical Approach to Testing"
category: Testing
tags: [Testing, Best Practices, Philosophy]
sharing: true
---
{% include JB/setup %}

## Testing is like Excercising... ##
A lot of people talk about doing it but not that many people actually do. Unfortunately, of the people that do test their software a lot do it half-assed, simply for the sake of having tests and not really thinking about **why** you should be testing.  You know who you these people are.  They are equivalent to the people you see hanging out in the gym for and hour or two but they spend more time people watching than actually working out, or they are the type of people that show up at the gym for 15 minutes, jog on the treadmill, and then leave. They are just there to say they went to the gym. You don't want to be that kind of developer do you? You should be performing even the most remedial tasks with conviction. **Take pride in your work because if you don't neither will anyone else**. 

Conversely you don't want to be the muscle head in the gym that is working out incessantly. Although you may have tests for every circumstance, you'll never get anything else done! You'll spend more time updating/refactoring your test suite or it will become outdated and useless. The old adage *"too much of a good thing can be harmful"* rings very true for most things, testing included.  

### Be Fit and Lean ###
You should strive to be the fit, lean developer. The one that has confidence, knows they have done their best, but isn't carrying around unnecessary weight.

You don't want to be those people but you also want Thankfully over the latter part of the most recent decade there has been more of a push for **healthy** software, where there are proper unit, acceptance, and integration tests and these tests are executed at the appropriate points in the development life cycle.

### Testing is Hard ###
Writing well thought out tests is not a trivial excerise.  You should not simply test the most common cases, nor should you strive to write tests for every scenario.  Knowing which tests to write and how best to write them to support your code base is a very difficult task, of which is largely dependent on . However, the most difficult part about testing, which bears the most resemblance to excercising, is that you need to stay diligent.  A typical code base is always evolving and therefore sometimes your tests will as well. Furthmore, you need to stay the course and really commit to testing.  Writing unit, acceptance, and integration tests **every** time new code is committed will help you trim the fat and keep it off.