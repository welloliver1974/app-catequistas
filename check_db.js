const { createClient } = require('@libsql/client');
const client = createClient({
  url: 'file:dev.db'
});

async function run() {
  const res = await client.execute("SELECT * FROM Encontro ORDER BY data ASC");
  console.log("ENCONTROS:");
  res.rows.forEach((row) => {
    console.log(row.id, row.tema, row.data, row.local);
  });
}
run();
