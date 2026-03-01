update site_settings
set welcome_message = 'Welcome. We gather to grow in Christ, study Scripture, and serve one another in love.'
where id = 1
  and (
    welcome_message ilike 'Welcome to Love % Good Works Club.%'
    or welcome_message ilike 'Welcome to Love and Good Works Club.%'
  );

insert into studies (slug, title, body_md)
values
  (
    'abide-in-christ-john-15',
    'Abide In Christ',
    '## Key Passage: John 15:1-11

Jesus teaches us to remain in Him so that our lives bear fruit for the glory of God.

- Read John 15:5 and discuss what it means to depend on Christ.
- Compare Galatians 2:20 with this passage.
- Close in prayer with Psalm 119:105.'
  )
on conflict (slug) do nothing;

insert into resources_links (category, title, url, description)
select
  'BOOK',
  'Mere Christianity',
  'https://www.harpercollins.com/products/mere-christianity-c-s-lewis',
  'Classic apologetics and Christian discipleship by C.S. Lewis.'
where not exists (
  select 1
  from resources_links
  where url = 'https://www.harpercollins.com/products/mere-christianity-c-s-lewis'
);

insert into resources_links (category, title, url, description)
select
  'BOOK',
  'The Abolition of Man',
  'https://www.harpercollins.com/products/the-abolition-of-man-c-s-lewis',
  'C.S. Lewis on objective moral truth and formative Christian thought.'
where not exists (
  select 1
  from resources_links
  where url = 'https://www.harpercollins.com/products/the-abolition-of-man-c-s-lewis'
);

insert into resources_links (category, title, url, description)
select
  'ARTICLE',
  'What Is The Gospel?',
  'https://www.desiringgod.org/topics/the-gospel',
  'A collection of gospel-centered teaching articles.'
where not exists (
  select 1 from resources_links where url = 'https://www.desiringgod.org/topics/the-gospel'
);

insert into resources_links (category, title, url, description)
select
  'TOOL',
  'DBS',
  'https://dbs.org',
  'Discovery Bible Study resources and training materials.'
where not exists (
  select 1 from resources_links where url = 'https://dbs.org'
);

insert into resources_links (category, title, url, description)
select
  'TOOL',
  'ShepherdStudy',
  'https://shepstudy.com',
  'Bible study software for deeper personal and group study.'
where not exists (
  select 1 from resources_links where url = 'https://shepstudy.com'
);
