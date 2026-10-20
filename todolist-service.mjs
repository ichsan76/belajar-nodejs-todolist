import fs from "node:fs/promises";

//untuk terhuhung ke app.mjs
export class TodoListService {
    //disimpan disini
    todoList = ["Programmer", "Zaman", "Now"];

    getJsonTodoList(){
        return JSON.stringify({
            code: 200,
            status: "OK",
            //map mengubah setiap teks dalam array menjadi objek yang
            //  mempunyai id dan todo
            data: this.todoList.map((value, index) => {
                return {
                    id: index,
                    todo: value
                }
            })
        });
    }
        //yang akan dipanggil function, ketika nanti si api todolist 
        // dipanggil
    getTodoList(request, response){
        response.write(this.getJsonTodoList());
        response.end();
    }
    //JSON.parse mengubah teks JSON menjadi objek JavaScript, lalu 
    // menyimpannya ke variabel body

    //Memastikan todo berupa teks dan tidak kosong.
    async createTodo(request, response){
        let data = ""; //menyiapkan tempat untuk mengumpulkan data dari request.
        request.on("data", (chunk) => {
          data += chunk.toString();//digunakan di backend untuk mengumpulkan potongan-potongan data (chunks) menjadi satu kesatuan utuh sebelum akhirnya diproses atau dikirim ke pengguna.
        });

        request.on("end", async () => {
            try{
                console.info(data); // Tambahkan untuk pemeriksaan
                const body = JSON.parse(data);//parse untuk teks json ke objek javascript

                //validasi todo
                if( //!== mengecek nilai dan tipe data
                    //sedangkan  === membandingkan nilai dan tipe data
                    typeof body.todo !== "string" || //atau
                    body.todo.trim() === "" //trim, memeriksa apakah todo hanya berisi spasi/kosong
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
                this.todoList.push(body.todo.trim());
                //Menunggu proses penyimpanan Todo ke file JSON selesai
                //  sebelum melanjutkan.
                await this.saveTodoList();

                response.statusCode = 201;
                response.write(this.getJsonTodoList());
                response.end();
            }catch (error) {
                response.statusCode = 400;
                response.write(JSON.stringify({
                    code: 400,
                    status: "bad Request",
                    message: "Format JSON tidak valid"
                }));
                response.end();
            }
        });

    }

    //Memastikan ID tersedia dan todo berupa teks yang tidak kosong.
    async updateTodo(request, response){
        let data = ""; //menyiapkan tempat untuk mengumpulkan data dari request.
      
        request.on("data", (chunk) => {
            data += chunk.toString();
        });
        request.on("end", async () => {
            try{
                const body = JSON.parse(data);//ubah JSON ke objek javascript
                
                //validasi todo
                if(
                    typeof body.todo !== "string" ||
                    body.todo.trim() === "" 
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

                //validasi ID
                const idValid = //Simbol && berarti DAN. Semua kondisi harus bernilai true agar idValid bernilai true.
                    Number.isInteger(body.id) && //memeriksa apakah body.id merupakan bilangan bulat.
                    body.id >= 0 && //memastikan ID lebih besar dari atau sama dengan 0.
                    body.id < this.todoList.length; //memastikan ID lebih kecil daripada jumlah data dalam array/database.
                    //tiga pemeriksaan itu memastikan ID berupa bilangan bulat, tidak negatif, dan berada dalam rentang indeks array.
                    //  Dengan begitu, API tidak sembarangan mengubah data yang tidak tersedia.
                if(!idValid){ //Tanda ! berarti kebalikan dari nilai boolean. Jadi, !idValid berarti ID tidak valid.
                    response.statusCode = 404;
                    response.write(JSON.stringify({
                        code: 404,
                        status: "Not Found",
                        message:"Todo tidak ditemuksn"
                    }));
                    response.end();
                    return;
                }

                //mengubah todo jika valid
                // Baris ini hanya dijalankan jika todo dan ID valid.
                //  trim() menghapus spasi di awal dan akhir teks.
                this.todoList[body.id] = body.todo.trim();

                await this.saveTodoList();

                response.statusCode = 200;
                response.write(this.getJsonTodoList());
                response.end();
            }catch (cerror) {
                response.statusCode = 400,
                response.write(JSON.stringify({
                    code: 400,
                    status: "Bad Request",
                    message: "Format JSON tidak valid"
                }));
                response.end();

            }
            
        });
    }
    async deleteTodo(request, response){
        //Mengumpulkan data request
       let data = "";

       request.on("data", (chunk)=> {
        data += chunk.toString();
       });

       request.on("end", async () => {
        try{
            //Mengubah JSON menjadi objek
            const body = JSON.parse(data);

            //validasi ID
            const idValid =
                Number.isInteger(body.id) &&
                body.id >= 0 &&
                body.id < this.todoList.length;

             //Menangani ID yang tidak valid
            if(!idValid) {
                response.statusCode = 404;
                response.write(JSON.stringify({
                    code: 404,
                    status: "Not Found",
                    message: "Todo tidak ditemukan"
                }));
                response.end();
                //menghentikan proses agar penghapusan tidak dilanjutkan.
                return;
            }

            //menghapus todo jika ID valid
            //splice menghapus data berdasarkan indeks.
            this.todoList.splice(body.id, 1);//Data "Zaman" dihapus dan indeks "Now" bergeser menjadi 1.

            await this.saveTodoList();

            response.statusCode = 200;
            response.write(this.getJsonTodoList());
            response.end();
        }catch (error) { //Bagian try...catch menangani JSON tidak valid dan mengirim status 400 Bad Request.
            response.statusCode = 400;
            response.write(JSON.stringify({
                code: 400,
                status: "Bad REquest",
                message: "Format JSON tidak valid"
            }));
            response.end();
        } 

       });
    }
    async loadTodoList(){
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

            await this.saveTodoList();
        }
    }

    async saveTodoList(){
        //Mengubah array menjadi teks JSON
        const data = JSON.stringify(
            this.todoList,
            null,
            2 //Angka 2 digunakan agar isi file memiliki indentasi dua spasi dan mudah dibaca.
        );
        //Menyimpan ke file
        await fs.writeFile("./todo-list.json", data);
    }

}


