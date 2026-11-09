const { execSync } = require('child_process');

const sql = `SELECT id, name, description, fqdn, git_repository, status FROM applications WHERE deleted_at IS NULL ORDER BY id;`;
const res = execSync('ssh -o StrictHostKeyChecking=no root@46.62.218.106 "docker exec -i coolify-db psql -U coolify -d coolify"', {
  input: sql
}).toString();

console.log(res);
