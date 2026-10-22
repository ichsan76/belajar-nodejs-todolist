import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import { error } from "node:console";

//createPool() membuat kumpulan koneksi yang dapat digunakan 
// kembali oleh aplikasi.

//untuk terhuhung ke app.mjs
export class TodoListService {
    connection = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "todolist_db",
        port: 3306
    });
    //disimpan disini
    //1.todoList = ["Programmer", "Zaman", "Now"];

    //1.getJsonTodoList(){
        //1.return JSON.stringify({
            //1.code: 200,
            //1.status: "OK",
            //map mengubah setiap teks dalam array menjadi objek yang
            //  mempunyai id dan todo
            //1.data: this.todoList.map((value, index) => {
                //1.return {
                    //1.id: index,
                    //1.todo: value
                //}
            //})
        //});

       

    
        //yang akan dipanggil function, ketika nanti si api todolist 
        // dipanggil
    async getTodoList(request, response){
        try{
            const [rows] = await this.connection.execute(
                "SELECT id, todo FROM todos" 
            );

            response.statusCode = 200;
            response.write(JSON.stringify({
                code: 200,
                status: "OK",
                data: rows
            }));
            response.end();
        } catch (error) {
            console.error(error);

            response.statusCode = 500;
            response.write(JSON.stringify({
                code: 500,
                status: "Internal Server Error",
                message: "Gagal mengambil data Todolist"
            }));
            response.end();
        }
    }

    //JSON.parse mengubah teks JSON menjadi objek JavaScript, lalu 
    // menyimpannya ke variabel body

    //Memastikan todo berupa teks dan tidak kosong.
    async createTodo(request, response){ //2.mengumpulkan data yang dikirim melalui request. dan ini body diubah ke data karena akan mengambil ke DB
        let body = ""; //menyiapkan tempat untuk mengumpulkan data dari request.
        request.on("data", (chunk) => {
          body += chunk.toString();//digunakan di backend untuk mengumpulkan potongan-potongan data (chunks) menjadi satu kesatuan utuh sebelum akhirnya diproses atau dikirim ke pengguna.
        });

        request.on("end", async () => {
            try{
                //console.info(data); // Tambahkan untuk pemeriksaan
                const data = JSON.parse(body);//parse untuk teks json ke objek javascript

                //validasi todo
                if( //!== mengecek nilai dan tipe data
                    //sedangkan  === membandingkan nilai dan tipe data
                    //1.typeof data.todo !== "string" || //atau
                    //1.data.todo.trim() === "" //trim, memeriksa apakah todo hanya berisi spasi/kosong
                    typeof data.todo !== "string" || //2.menghilangkan spasi di awal dan akhir teks.
                    !data.todo.trim()
                ) {
                    response.statusCode = 400;
                    response.write(JSON.stringify({
                        code: 400,
                        status: "Bad Request",
                        message: "Todo tidak boleh kosong"
                    }));
                    response.end();
                    return;
                }
                //Menambahkan todo jika valid.
                //digunakan pada tipe data String 
                // untuk menghapus karakter spasi awal dan akhir.
                //1.this.todoList.push(body.todo.trim());
                //Menunggu proses penyimpanan Todo ke file JSON selesai
                //  sebelum melanjutkan.
                //1.await this.saveTodoList();

                //1.response.statusCode = 201;
                //1.response.write(this.getJsonTodoList());
                //1.response.end();
                const todo = data.todo.trim();

                const [result] = await this.connection.execute(
                    "INSERT INTO todos (todo) VALUES (?)", //2.menyimpan Todolist ke MySQL.
                    [todo] //2. mengisi tanda ? dengan nilai todo secara aman.
                );

                response.statusCode = 201; //2 menandakan data berhasil dibuat.
                response.end(JSON.stringify({
                    code: 201,
                    status: "Created",
                    data: {
                        id: result.insertId, //2. mengambil ID yang dibuat otomatis oleh MySQL.
                        todo: todo
                    }
                }));

            }catch (error) {
                //1.response.statusCode = 400;
                //1.response.write(JSON.stringify({
                    //1.code: 400,
                    //1.status: "bad Request",
                    //1.message: "Format JSON tidak valid"
                //1.}));
                //1.response.end();

                console.error(error);

                response.statusCode = 500;
                response.write(JSON.stringify({
                    code: 500,
                    status: "Internal Server Error",
                    message: "Gagal menyimpan Todolist"
                }));
            }
        });

    }

    //Memastikan ID tersedia dan todo berupa teks yang tidak kosong.
    async updateTodo(request, response){
        let body = ""; //menyiapkan tempat untuk mengumpulkan data dari request.
      
        request.on("data", (chunk) => { //Mengumpulkan isi permintaan.
            body += chunk.toString();
        });
        request.on("end", async () => {
            try{
                //1.const body = JSON.parse(data);//ubah JSON ke objek javascript
                
                const pathaname = new URL(
                    request.url,
                    "http://localhost:3003"
                ).pathname;

                    //Number(...) Mengubah ID dari URL menjadi angka.
                const id = Number(pathaname.split("/").filter(Boolean).pop());
                //pathaname.split("/") Memotong teks berdasarkan tanda garis miring (/) menjadi sebuah array (daftar teks). Tanda / di awal menghasilkan teks kosong "".
                //.filter(Boolean) Membuang semua elemen yang kosong atau tidak valid (seperti "" di awal tadi), sehingga menyisakan elemen yang berisi saja.
                //pop() Mengambil elemen paling terakhir dari array tersebut.
                //Number(...) Mengubah teks "45" menjadi tipe data angka (number). Nilai ini kemudian disimpan ke dalam variabel id.

                //validasi todo
                if
                    //1.typeof body.todo !== "string" ||
                    //1.body.todo.trim() === ""
                    
                    (!Number.isInteger(id) || id <= 0){ //Mengecek apakah nilai id adalah bilangan bulat (bukan desimal/float, bukan teks, dsb).
                        response.statusCode = 400;
                        response.end(JSON.stringify({
                            code: 400,
                            status: "Bad Request",
                            message: "ID Todolist tidak valid"
                        }));
                        return;
                    }

                const data = JSON.parse(body); //Mengubah JSON menjadi objek JavaScript. 
                
                if(typeof data.todo !== "string" || !data.todo.trim()){
                    response.statusCode = 400;
                    response.end(JSON.stringify({
                        code: 400,
                        status: "Bad Request",
                        message: "Todo tidak boleh kosong"
                    }));
                    return;
                }
                //1.{
                    //1.response.statusCode = 400;
                    //1.response.write(JSON.stringify({
                        //1.code: 400,
                        //1.status: "Bad Request",
                        //1.message: "Todo tidak boleh kosong"
                    //1.}));
                    //1.response.end();
                    //1.return;
                //1.}

                const todo = data.todo.trim(); // Ini memastikan teks yang disimpan ke database adalah teks murni (bukan spasi kosong).
                //UPDATE todos SET todo = ? WHERE id = ?
                // 	Mengubah teks todo berdasarkan ID.
                const [result] = await this.connection.execute(
                    "UPDATE todos SET todo = ? WHERE id = ?",
                    [todo, id]//Mengisi parameter SQL secara berurutan.
                );
                if(result.affectedRows === 0){ //affectedRows Memeriksa apakah ada baris yang cocok dan berubah.
                    response.statusCode = 404;
                    response.end(JSON.stringify({
                        code: 404,
                        status: "Not Found",
                        message: "Todolist tidak ditemukan"
                    }));
                    return;
                }

                    

                //1.validasi ID
                //1.const idValid = //Simbol && berarti DAN. Semua kondisi harus bernilai true agar idValid bernilai true.
                    //1.Number.isInteger(body.id) && //memeriksa apakah body.id merupakan bilangan bulat.
                    //1.body.id >= 0 && //memastikan ID lebih besar dari atau sama dengan 0.
                    //1.body.id < this.todoList.length; //memastikan ID lebih kecil daripada jumlah data dalam array/database.
                    //tiga pemeriksaan itu memastikan ID berupa bilangan bulat, tidak negatif, dan berada dalam rentang indeks array.
                    //  Dengan begitu, API tidak sembarangan mengubah data yang tidak tersedia.
                //1.if(!idValid){ //Tanda ! berarti kebalikan dari nilai boolean. Jadi, !idValid berarti ID tidak valid.
                    //1.response.statusCode = 404;
                    //1.response.write(JSON.stringify({
                        //1.code: 404,
                        //1.status: "Not Found",
                        //1.message:"Todo tidak ditemuksn"
                    //1.}));
                    //1.response.end();
                    //1.return;
                //1.}

                //mengubah todo jika valid
                // Baris ini hanya dijalankan jika todo dan ID valid.
                //  trim() menghapus spasi di awal dan akhir teks.
                //1.this.todoList[body.id] = body.todo.trim();

                //1.await this.saveTodoList();

                //1.response.statusCode = 200;
                //1.response.write(this.getJsonTodoList());
                //1.response.end();

                response.statusCode = 200;
                response.end(JSON.stringify({
                    code: 200,
                    status: "OK",
                    data: {
                        id: id,
                        todo: todo
                    }
                }));

            }catch (error) {
                console.error(error);

                response.statusCode = 500;
                response.end(JSON.stringify({
                    code: 500,
                    status: "Internal Server Error",    //1."Bad Request",
                    message: "Gagal memperbarui"    //1."Format JSON tidak valid"
                }));
                //1.response.end();

            }
            
        });
    }
    async deleteTodo(request, response){
        //Mengumpulkan data request
       //1.let data = "";

       //1.request.on("data", (chunk)=> {
        //1.data += chunk.toString();
       //1.});

       //1.request.on("end", async () => {
        try{
            //Mengubah JSON menjadi objek
            //1.const body = JSON.parse(data);

            //validasi ID
            //1.const idValid =
                 //1.Number.isInteger(body.id) &&
                 //1.body.id >= 0 &&
                 //1.body.id < this.todoList.length;

             //Menangani ID yang tidak valid
             //1.if(!idValid) {
                 //1.response.statusCode = 404;
                 //1.response.write(JSON.stringify({
                     //1.code: 404,
                     //1.status: "Not Found",
                     //1.message: "Todo tidak ditemukan"
                 //1.}));
                 //1.response.end();
                //menghentikan proses agar penghapusan tidak dilanjutkan.
                 //1.return;

                 const pathname = new URL(
                    request.url,
                    "http://localhost:3003"
                 ).pathname;
                
                 //Bagian ini mengambil ID dari URL:
                 const id = Number(pathname.split("/").filter(Boolean).pop());

                 if(!Number.isInteger(id) || id <= 0){
                    response.statusCode = 400;
                    response.end(JSON.stringify({
                        code: 400,
                        status: "Bad Request",
                        message: "ID Todolist tidak valid"
                    }));
                    return;
                 }
            

                const [result] = await this.connection.execute(
                "DELETE FROM todos WHERE id =?", //menghapus baris berdasarkan ID.
                [id]
                );

            if (result.affectedRows === 0){
                response.statusCode = 404;
                response.end(JSON.stringify({

                    code: 404,
                    status: "Not Found",
                    message: "Todolist tidak ditemukan"
                }));
                return;
            }

            response.statusCode = 200;
            response.end(JSON.stringify({
                code: 200,
                status: "OK",
                message: "Todolist berhasil dihapus",
                data: {
                    id: id
                }

            }));

            //menghapus todo jika ID valid
            //splice menghapus data berdasarkan indeks.
            //1.this.todoList.splice(body.id, 1);//Data "Zaman" dihapus dan indeks "Now" bergeser menjadi 1.

              //1.await this.saveTodoList();

              //1.response.statusCode = 200;
              //1.response.write(this.getJsonTodoList());
              //1.response.end();
        }catch (error) { //Bagian try...catch menangani JSON tidak valid dan mengirim status 400 Bad Request.
            console.error(error); //sebelumnya untuk json kode 400
            
            response.statusCode = 500;
            response.write(JSON.stringify({
                code: 500,
                status: "Internal Server Error", //"Bad REquest",
                message: "Gagal menghapus Todolist" //"Format JSON tidak valid"
            }));
            
        } 

    }

    async loadTodoList(){ //memuat/menampung TodoList
        try{
            const data = await fs.readFile( //membaca berkas file
                "./todo-list.json",
                "utf-8" //membuat hasil bacaan berupa teks.
            );
            //Mengubah teks JSON menjadi array
            this.todoList = JSON.parse(data);

        }catch (error) {
            //Menangani file yang belum ada.
            //ENOENT berarti file atau path tidak ditemukan. Jika file belum ada, 
            // fungsi akan membuatnya melalui saveTodoList(). Kesalahan lain tetap diteruskan agar tidak disembunyikan.
            if (error.code !== "ENOENT") {
                throw error;
            }
            // menunggu hingga proses penyimpanan data daftar tugas (todo list) selesai sebelum melanjutkan 
            // ke baris kode berikutnya.
            await this.saveTodoList();
        }
    }

    async saveTodoList(){ //menyimpan TodoList
        //menjadi string teks berformat JSON.
        const data = JSON.stringify(
            this.todoList,
            null, // tanpa ada yang disaring (difilter) atau diubah nilainya selama proses konversi.
            2 //Angka 2 digunakan agar isi file memiliki indentasi dua spasi dan mudah dibaca.
        );
        //Menyimpan ke file atau membuat file baru jika file todo-list.json sudah ada,
        //isinya akan ditimpa (overwrite) dengan data yang baru.
        await fs.writeFile("./todo-list.json", data);
    }

}


