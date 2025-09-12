import pkg from "pg";
const { Pool } = pkg;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:pa55w02d@localhost:5432/personal-blog-data",
});

export default connectionPool;
