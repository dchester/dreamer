### Collection Fields

Possible fields or attributes an entity might have

```
- title
- create_time   default=now
- status        enum=(draft|published|deleted)
- description   nullable
- is_required   boolean
- index         integer
- meta_json     text,nullable
```

> unique: title,index
> charset: utf-8

