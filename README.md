# Dreamer

Markdown-powered REST service framework

## Introduction

With dreamer, you specify the database schema and HTTP resources in markdown(!), and you can stop there if you want.  Just by documenting the schema and resources you get a working read/write RESTful service.

Under the hood the magic comes from [Express](http://expressjs.com/), [Sequelize](http://www.sequelizejs.com/), and [Epilogue](https://github.com/dchester/epilogue).  As your project evolves you can work directly with those layers as you need more flexibility.

See [dreamer-example](http://github.com/dchester/dreamer-example) for a working example that implements a backend RESTful service for web logs.

### Project directory structure

At a minimum you'll need a configuration file, a schema definition, and a listing of resources.

```
config/
  └ default.json
docs/
  ├ schema.md
  └ resources.md
```

### Configuration

In configuration specify details about the database and other settings.

```json
{
  "database": {
    "dialect": "mysql",
    "database": "sampledb",
    "username": "sample",
    "password": "sample"
  },
  "server": {
    "jsonp": false,
    "port": 8000
  }
}
```

## Schema

List your schema in markdown format.  Use third-level headings for table names which may be followed by description.  Then list the columns in a code section, one column per line, with optional annotations to specify column details.  The framework will intuit appropriate data types, which you may override.  By default columns will be non-nullable.

##### Example schema

    ### users
    End users of the application
    ```
    - username    unique,alpha
    - email       email
    - name
    - birthdate   date
    ```
    
    ### categories
    Content categories
    ```
    - name
    - description   nullable
    - is_active     default=true
    ```

##### Column annotations

Annotate columns to give hints about data types and validation rules.  Separate them with commas; mix them all up together.

- specify a data type: `string`,`integer`,`float`,`boolean`
- specify a constraint or lack thereof: `unique`, `nullable` 
- specify a validation: `email`,`url`,`alpha` 
- specify a default value: `default=<value>`

##### From the command line

Use the `dreamer` command-line tool to view and interact with the schema.  Each command takes an optional parameter to limit the command to a particular table.

```
# list all tables
$ dreamer schema 

# show create table SQL statements
$ dreamer schema-dump

# create or alter the schema
$ dreamer schema-sync

# create or alter a particualr table
$ dreamer schema-sync [table name]
```

##### "But markdown isn't a schema definition language..."

If specifying a database schema in markdown is too silly for your taste or makes you feel crazy, you can skip that part and either define the schema in JSON, or you can set up your own models with Sequelize directly and pass those in to `dreamer.initialize`.


## Resources

List resources in markdown format.  For each route use a third-level heading starting with the HTTP verb followed by the Sinatra-style URL path.  For example, we may have a route that gives back details about a category:

```
### GET /users/:user_id
Get details about a particular user
```

Each route may have an associated example response.  Dreamer will match the structure of real responses to the structure of the example specified in the markdown.  Specify example responses with a sixth-level heading followed by a code block:

    ### GET /users/:user_id
    Get details about a particular user
    
    ###### Example Response
    ```
    {
      "name": "James Cooper",
      "username": "jamescooper",
      "email": "jimmycooper@jimzindustries.biz"
    }
    ```

You may also specify request parameters.  Use a sixth-level heading followed by via a markdown table:

    ### POST /users
    Create a new user
    
    ###### Request Parameters
    ```
    name      | required? | description
    ----------|-----------|------------
    name      | required  | Full legal name of the user
    username  | required  | Username
    email     | required  | Email address
    birthdate | required  | User birthdate
    ```

##### From the command line

Use the `dreamer` command-line tool to view routes and resources.

```
# list resources
$ dreamer resources [route prefix]
```

##### "But markdown is just wrong for this..."

You can pass in your own `resources` JSON configuration to `dreamer.initialize`.  For more flexibility than that, find your resource under `dream.resources` and hook into request milestones from its epilogue controller. 

## Run the server

Start the server up with `dreamer run`.

```
$ dreamer run
Server listening on port 3000...
```

## Conventions and assumptions

Dreamer implements and expects some conventions to be followed:

- Routes, tables, and column names are lowercase separated by underscores
- Every table has a primary key called "id", whether you specify it yourself or not
- The last path component for each route refers to the model in question
- Table names and URI endpoints are are plural
