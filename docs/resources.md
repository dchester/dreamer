# Resources

### GET /breadwinners

List breadwinners

###### Example Response

```
[
	{
		"id": 1,
		"name": "James Cooper"
	}, {
		"id": 2,
		"name": "Arthur Chester"
	}
]
```

### POST /breadwinners

Create a new breadwinner.

###### Request Parameters

name | required? | description
-----|-----------|------------
name | required  | Legal full name
paypal_email | required | Paypal email address to pay out earnings to


### GET /breadwinners/:breadwinner_id

###### Example Response

```
{
	"id": 1,
	"name": "James Cooper",
	"paypal_email": "jamescooper@cooperindustries.biz"
}

```

### POST /breadwinners/:breadwinner_id/earnings

###### Request Parameters

name | required? | description
-----|-----------|------------
breadwinner_id | required | Breadwinner to be awarded
amount | required | Earnings amount in USD
memo | optional | Application-level metadata about the earnings

### GET /breadwinners/:breadwinner_id

###### Example Response

```
{
	"earnings_date": "2012-01-01",
	"amount": 0.25,
	"memo": "standard commission"
}
```

