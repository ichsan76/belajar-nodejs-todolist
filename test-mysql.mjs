import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
    host: "localhost", //database berada di komputer kamu.
    user: "root", //nama pengguna yang umum digunakan pada instalasi XAMPP.
    password: "",
    database: "todolist_db", //nama database yang baru kamu buat.
    port: 3306 //port MySQL/MariaDB yang umum digunakan XAMPP.
});

try{
    //rows berisi baris-baris hasil query. await menunggu 
    // sampai database mengembalikan hasilnya.
    //1.const [rows] = await connection.query(
        //SELECT berarti mengambil atau membaca data.
        //id, todo adalah kolom yang ingin ditampilkan.
        //FROM todos berarti data diambil dari tabel todos.
        //2."SELECT ID, todo FROM todos WHERE id = 2;"
        const [result] = await connection.query(
            "INSERT INTO todos (todo) VALUES (?)",
            ["Belajar INSERT dari Node.js"]
            //INSERT INTO todos — menentukan tabel tujuan.
            //(todo) — kolom yang akan diisi.
            //VALUES (?) — tempat untuk nilai yang akan dimasukkan.
            //["Belajar INSERT dari Node.js"] — nilai yang mengisi tanda ?.
            //
    );
        console.info("Data Berhasil ditambahkan");
        //result.insertId — ID otomatis dari data yang baru ditambahkan.
        console.info("ID data baru", result.insertId);
    //1.console.info("Data Todolist:");
    //1.console.table(rows);
} catch (error) {
    console.error("Query gagal", error.message);
} finally {
    await connection.end();
}