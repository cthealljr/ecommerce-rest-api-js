-- Select Cart Item(s) with Product Information
SELECT ci.id, ci.cart_id, ci.product_id, ci.qty, ci.created, ci.modified,
pi.name, pi.price
FROM cart_items AS ci
JOIN products AS pi
ON pi.id = ci.product_id
-- filterColumn must be alias in order to use ci.id as the filter column
WHERE ${filterColumn:alias} = ${filterValue}