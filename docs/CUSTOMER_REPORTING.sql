-- Minimal future reporting, using the same purchase and customer records.
-- Restrict these queries to the owner's existing database access; no public API.
SELECT count(*) FILTER (WHERE registered_at IS NOT NULL) AS registered_customers,
 count(*) FILTER (WHERE registered_at IS NULL AND EXISTS(SELECT 1 FROM milo_purchases p WHERE p.customer_id=c.id)) AS guest_purchasers,
 count(*) FILTER (WHERE marketing_consent) AS opted_in_customers
FROM milo_customer_profiles c WHERE livemode=true;

WITH customers AS (SELECT customer_id,count(*) AS orders FROM milo_purchases WHERE livemode=true AND status='paid' GROUP BY customer_id)
SELECT avg((orders>1)::int) AS repeat_purchase_rate FROM customers;

SELECT avg(amount_paid) AS average_order_value_cents,currency FROM milo_purchases WHERE livemode=true AND status='paid' GROUP BY currency;

SELECT customer_id,sum(jsonb_array_length(items)) AS products_purchased FROM milo_purchases WHERE livemode=true AND status='paid' GROUP BY customer_id;

SELECT items->0->>'slug' AS first_assignment,items->1->>'slug' AS second_assignment,count(*) FROM milo_purchases WHERE livemode=true AND status='paid' AND jsonb_array_length(items)>1 GROUP BY 1,2 ORDER BY 3 DESC;

SELECT c.slug,count(DISTINCT c.id) AS recommendation_clicks,count(DISTINCT p.session_id) AS attributed_purchases
FROM milo_recommendation_clicks c JOIN milo_customer_profiles u ON u.id=c.customer_id AND u.livemode=true
LEFT JOIN milo_purchases p ON p.recommendation_click_id=c.id AND p.status='paid' GROUP BY c.slug;
