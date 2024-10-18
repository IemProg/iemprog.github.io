---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1
    after: 3
---

<div class="post">
  <h1>{{ site.blog_name }}</h1>
  <p>{{ site.blog_description }}</p>

  <ul class="post-list">
    {% assign postlist = site.posts %}
    {% for post in postlist %}
      <li>
        <h2>
          <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h2>
        <p class="post-meta">{{ post.date | date: '%B %-d, %Y' }}</p>
        <p>{{ post.description }}</p>
      </li>
    {% endfor %}
  </ul>

{% if paginator.total_pages > 1 %}
{% include pagination.liquid %}
{% endif %}

</div>
