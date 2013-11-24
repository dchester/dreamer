# Dreamer

Markdown-powered REST service framework

## Introduction

With dreamer, you specify the database schema and HTTP resources in markdown(!), and you can stop there if you want.  Just by documenting the schema and resources you get a working read/write RESTful service.

Under the hood the magic comes from [Express](http://expressjs.com/), [Sequelize](http://www.sequelizejs.com/), and [Epilogue](https://github.com/dchester/epilogue).  As your project evolves you can work directly with those layers as you need more flexibility.

##### Working example

See [dreamer-example](http://github.com/dchester/dreamer-example) for a working example uses Dreamer to implement a backend RESTful service for web logs.

##### Project directory structure

At a minimum you'll need a configuration file, a schema definition, and a listing of resources.  For more flexibility you can include your own logic as custom extensions.

```
config/
  └ default.json
spec/
  ├ schema.md
  └ resources.md
extensions/
  └ custom.js
app.js
```

##### Configuration

In configuration specify details about the database and other settings.

```json
{
  "database": {
    "dialect": "mysql",
    "database": "sampledb",
    "username": "sample",
    "password": "sample"
  }
}
```

To use SQLite instead of MySQL, specify `sqlite` for the dialect, and add a `storage` key pointing to the file on disk.


## App

Set up your application as a normal express project, but instead of calling `app.listen()`, initialize a dreamer instance and call `dream()`.

```javascript
var http = require('http');
var express = require('express');
var Dreamer = require('dreamer');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.use(express.bodyParser());
	app.use(app.router);
});

var dreamer = Dreamer.initialize({
	app: app,
	schema: "spec/schema.md",
	resources: "spec/resources.md"
});

dreamer.dream();
```

## Schema

List your schema in markdown format.  Use third-level headings for table names which may be followed by description.  Then list the columns in a code section, one column per line, with optional annotations to specify column details.  The framework will intuit appropriate data types, which you may override.  By default columns will be non-nullable.  Each table gets an `id` column whether you specify it or not.  See a full working [example schema](https://github.com/dchester/dreamer-example/blob/master/docs/schema.md) from [dreamer-example](https://github.com/dchester/dreamer-example).

##### Example schema

    ### Blogs
    Whole entire blogs.
    ```
    - name
    - description
    - author_id    fk=authors.id
    ```
    
    ### Authors
    People who write blogs and comment on them.
    ```
    - name
    - handle       alpha,unique
    - email        email
    - website      nullable
    - signup_date
    ```
    ...
    
##### Column annotations

Annotate columns to give hints about data types and validation rules.  Separate them with commas; mix them all up together.

- specify a data type: `string`,`integer`,`float`,`boolean`
- specify a constraint or lack thereof: `unique`, `nullable` 
- specify a validation: `email`,`url`,`alpha` 
- specify a default value: `default=<value>`
- specify a foreign key: `fk=<table.column>`
- specify an enum: `enum=(published|draft|deleted)`

##### From the command line

Run your app from the command line to view and interact with the schema.  Each command takes an optional parameter to limit the command to a particular table.

```
# list all tables
$ node app schema 

# show create table SQL statements
$ node app schema-dump

# create or alter the schema
$ node app schema-sync

# create or alter a particualr table
$ node app schema-sync [table name]
```

##### "But markdown isn't a schema definition language..."

If specifying a database schema in markdown is too silly for your taste or makes you feel crazy, you can skip that part and either define the schema in JSON, or you can set up your own models with Sequelize directly and pass those in to `dreamer.initialize`.


## Resources

List resources in markdown format.  For each route use a third-level heading starting with the HTTP verb followed by the Sinatra-style URL path.  See a full working [example resources listing](https://github.com/dchester/dreamer-example/blob/master/spec/resources.md) from [dreamer-example](https://github.com/dchester/dreamer-example).

We may have a route that gives back a listing of blogs:

     ### GET /blogs
     Get a listing of blogs

Each route may have an associated example response.  Dreamer will match the structure of real responses to the structure of the example specified in the markdown.  Specify example responses with a sixth-level heading followed by a code block:

   
    ### GET /blogs
    Get a listing of blogs

    ###### Example Response
    ```json
    [
      {
        "id": 1000,
        "name": "The trials of being James"
      }
    ]
    ```

You may also specify request parameters.  Use a sixth-level heading followed by via a markdown table:

    ### POST /blogs
    Create a new blog

    ###### Request Parameters
    name        | required? | description
    ------------|-----------|------------
    name        | required  | Name of the blog
    author_id   | required  | Author of the blog
    description | optional  | Description of the blog

##### From the command line

Use the `dreamer` command-line tool to view routes and resources.

```
# list resources
$ dreamer resources [route prefix]
```

##### "But markdown is just wrong for this..."

You can pass in your own `resources` JSON configuration to `dreamer.initialize`.  For more flexibility than that, find your resource under `dream.resources` from within an extension and hook into request milestones from its epilogue controller. 

## Run the server

Start the server up with `node app run`.

```
$ node app run
Server listening on port 3000...
```

## Conventions and assumptions

Dreamer implements and expects some conventions to be followed:

- Routes, tables, and column names are lowercase separated by underscores
- Every table has a primary key called "id", whether you specify it yourself or not
- The last path component for each route refers to the model in question
- Table names and URI endpoints are are plural
