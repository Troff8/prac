const http = require('http');
const url = require('url');
const mysql = require('mysql2');

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);

  if (req.method === 'GET' && pathname === '/') {
    const ip = 196;

    dbReadWrite(ip)
      .then(data => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      })
      .catch(error => {
        console.error('Error request:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error 500');
      });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not fount 404');
  }
});
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Функция для чтения и записи в базу данных
function dbReadWrite(ip) {
  const connection = mysql.createConnection({
    host: 'db', // бд
    user: 'root', // Пользователь базы данных
    password: 'troff', // Пароль пользователя
    database: 'troff' // Имя базы данных
  });

  return new Promise((resolve, reject) => {
    connection.connect(err => {
      if (err) {
        reject(err);
        return;
      }

      const randomNumber = getRandomInt(1,100);

      // SQL запрос для вставки данных в таблицу
      const insertQuery = 'INSERT INTO new_table (ip, random_number) VALUES (?, ?)';
      connection.query(insertQuery, [ip, randomNumber], (err, result) => {
        if (err) {
          connection.end();
          reject(err);
          return;
        }

        // SQL запрос для выборки данных из таблицы
        const selectQuery = 'SELECT * FROM new_table';
        connection.query(selectQuery, (err, rows) => {
          connection.end();
          if (err) {
            reject(err);
            return;
          }

          const data = rows.map(row => {
            return {
              id: row.id,
              ip: row.ip,
              random: row.random_number
            };
          });

          resolve(data);
        });
      });
    });
  });
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
