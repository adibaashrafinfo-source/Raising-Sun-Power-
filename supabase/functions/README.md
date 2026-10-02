# Edge functions

Every call to a courier's API happens here, never in the browser: the API key
and secret are read from `courier_settings` with the service role, so they are
never part of a network request the customer's (or an attacker's) dev tools can
see.

| Function | Input | What it does |
| --- | --- | --- |
| `test-courier-connection` | `{ api_key?, secret_key? }` | Calls Steadfast `GET /get_balance` to prove a key pair works. Blank input tests the saved keys. |
| `create-steadfast-order` | `{ order_id, recipient_name?, recipient_phone?, recipient_address?, cod_amount? }` | Books the order with `POST /create_order` and writes the consignment back onto the order. |
| `check-steadfast-status` | `{ order_id }` or `{ consignment_id }` | Reads `GET /status_by_cid/{id}` and updates `courier_status`. |
| `sync-all-courier-statuses` | — | Refreshes every consignment that is not yet delivered/cancelled/returned, five at a time. |

All four require a signed-in admin, manager, staff or delivery account;
`sync-all-courier-statuses` also accepts the service-role key so a cron job can
call it (see the commented block at the end of `rsp_courier_steadfast.sql`).

Deploying by hand, if you ever need to:

```
supabase functions deploy create-steadfast-order
supabase functions deploy check-steadfast-status
supabase functions deploy sync-all-courier-statuses
supabase functions deploy test-courier-connection
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by the platform —
nothing else needs to be set.
