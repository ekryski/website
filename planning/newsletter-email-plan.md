# Plan: Automated Emails When Publishing New Content

Since you want this to be "automated and lightweight," the best approach is to let Kit handle the email sending automatically by watching your RSS feed. You won't need to manually write or send emails.

## The Workflow

1. **You Write:** Create a new article in `src/app/articles/`.
2. **You Push:** Commit and push to GitHub (`git push`).
3. **Site Builds:** GitHub Actions builds your site and updates `https://erickryski.com/feed.xml`.
4. **Kit Detects:** Kit checks your feed (usually every 15-30 mins), sees the new item, and automatically generates an email.
5. **Kit Sends:** The email is sent to your subscribers.

## One-Time Setup in Kit

1. **Log in to Kit** and go to **Send** > **RSS**.
2. **Add Feed:** Enter your feed URL: `https://erickryski.com/feed.xml`.
3. **Configure Template:**
   - **Single Post:** Choose this if you want an email sent for *every* new article immediately.
   - **Weekly Digest:** Choose this if you want to bundle posts (better if you post frequently).
4. **Design:** Kit will pull the `title`, `description`, and `link` from your RSS feed. You can wrap this in a simple template that says "I just published a new article..."
5. **Activate:** Set the status to "Active".

That's it! Now your publishing workflow is just "push code," and the emails handle themselves.
