# Schema

### Breadwinners

Person or organization to receive earnings.

```
- name
- paypal_email    unique,string,email
```

### Earnings

Instances of earnings.

```
- earnings_time
- amount          decimal
- payout_id
```

### Payouts

Aggregated earnings payed and delivered to the breadwinner

```
- payout_time
- external_transaction_id
- payout_status_id
```

### Payout Statuses

Possible statuses for pending and delivered payouts

```
- name
```

