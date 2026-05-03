const db = require('../../config/db');

const search = async ({ q, category_id, min_price, max_price, limit, offset }) => {
  const hasSearch = q !== null && q !== undefined;
  const params = [];
  let paramIndex = 0;

  let selectClause = 'SELECT p.*';
  if (hasSearch) {
    paramIndex++;
    selectClause += `,
      (COALESCE(ts_rank_cd(p.search_vector, websearch_to_tsquery('english', $${paramIndex})), 0)
       + (COALESCE(similarity(p.name, $${paramIndex}), 0)
          + COALESCE(similarity(p.description, $${paramIndex}), 0)) * 0.25) AS score`;
    params.push(q);
  }

  let conditions = ['p.is_active = true'];

  if (hasSearch) {
    const searchIdx = paramIndex;
    conditions.push(`(p.search_vector @@ websearch_to_tsquery('english', $${searchIdx})
      OR p.name % $${searchIdx}
      OR p.description % $${searchIdx})`);
  }

  if (category_id) {
    paramIndex++;
    conditions.push(`p.category_id = $${paramIndex}`);
    params.push(category_id);
  }
  if (min_price !== undefined) {
    paramIndex++;
    conditions.push(`p.price >= $${paramIndex}`);
    params.push(min_price);
  }
  if (max_price !== undefined) {
    paramIndex++;
    conditions.push(`p.price <= $${paramIndex}`);
    params.push(max_price);
  }

  const whereClause = conditions.join(' AND ');
  const orderClause = hasSearch
    ? 'ORDER BY score DESC'
    : 'ORDER BY p.created_at DESC';

  const limitIdx = paramIndex + 1;
  const offsetIdx = paramIndex + 2;

  const dataQuery = `
    ${selectClause}
    FROM products p
    WHERE ${whereClause}
    ${orderClause}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM products p
    WHERE ${whereClause}`;

  const dataParams = [...params, limit, offset];
  const countParams = [...params];

  const [dataResult, countResult] = await Promise.all([
    db.query(dataQuery, dataParams),
    db.query(countQuery, countParams),
  ]);

  return {
    products: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
  };
};

module.exports = { search };