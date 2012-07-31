---
layout: default
---
<!-- {% include JB/setup %} -->
{% assign first_post = site.posts.first %}

<div class="page-header">
  <h1>{{ first_post.title }}</h1>
</div>

<div class="row-fluid">
  <div class="span3 columns well">
    <h3>Share this!</h3>
    <p>If you like it, found it intriguing, think it's useful, or you think I'm a complete idiot.</p>
    {% include JB/sharing %}
  </div>
  <div class="span9">
    {{ first_post.content }}
  </div>
</div>
<hr>
<div class="row-fluid">
  {% include JB/comments %}
</div>
<div class="row-fluid">
  <div class="span4">
    <h4>Published</h4>
    <div class="date"><span>{{ first_post.date | date_to_long_string }}</span></div>

  {% unless first_post.tags == empty %}
    <h4>Tags</h4>
    <ul class="tag_box">
    {% assign tags_list = first_post.tags %}
    {% include JB/tags_list %}
    </ul>
  {% endunless %}  
  </div>
  <div class="span4 offset4">
    <div class="pagination">
      <ul>
      {% if first_post.previous %}
        <li class="prev"><a href="{{ BASE_PATH }}{{ first_post.previous.url }}" title="{{ first_post.previous.title }}">&larr; Previous</a></li>
      {% else %}
        <li class="prev disabled"><a>&larr; Previous</a></li>
      {% endif %}
        <li><a href="{{ BASE_PATH }}{{ site.JB.archive_path }}">Archive</a></li>
      {% if first_post.next %}
        <li class="next"><a href="{{ BASE_PATH }}{{ first_post.next.url }}" title="{{ first_post.next.title }}">Next &rarr;</a></li>
      {% else %}
        <li class="next disabled"><a>Next &rarr;</a></li>
      {% endif %}
      </ul>
    </div>
  </div>
</div>