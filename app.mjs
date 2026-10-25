import http from "http";
import {TodoListService} from "./todolist-service.mjs";
//service untuk menghubungkan
const service = new TodoListService();
const server = http.createServer((request, response) => {
    //mencoba konek memakai test.http
    //response.write("Todolist API");
    //response.end();

      // 1. Pengaturan CORS
    // Mengizinkan frontend mengakses backend.
    response.setHeader("Access-Control-Allow-Origin", "*");
    // Mengizinkan metode HTTP yang digunakan API.
    response.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    // Mengizinkan header Content-Type dari frontend.
    response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    // 2. Menangani preflight
    //menangani permintaan OPTIONS (preflight)
    if(request.method === "OPTIONS"){
        response.writeHead(204);
        response.end();
        return;
    }


    // 3. Pengaturan respons JSON
     //Baris ini memberi tahu client bahwa 
    // isi respons dari server berupa JSON.
    response.setHeader("Content-Type", "application/json")
    //- Jika GET, server memanggil fungsi getTodoList().
    // Fungsi tersebut mengambil data Todolist dan mengirimkannya 
    // kepada client. Contoh permintaan melalui test.http:

    
    // 4. Routing API yang sudah kamu miliki
    if(request.method === "GET"){
        service.getTodoList(request, response);
    }else if(request.method === "POST"){
        service.createTodo(request, response);
    }else if(request.method === "PUT"){
        service.updateTodo(request, response);
    }else if(request.method === "DELETE"){
        service.deleteTodo(request, response);
    }
});

//Kebenarannya bergantung pada implementasi fungsi di todolist-service.mjs.
await service.loadTodoList();

server.listen(3003, () => {
    console.info("Server berjalan di port 3003");
});
