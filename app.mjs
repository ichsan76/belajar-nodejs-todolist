import http from "http";
import {TodoListService} from "./todolist-service.mjs";
//service untuk menghubungkan
const service = new TodoListService();
const server = http.createServer((request, response) => {
    //mencoba konek memakai test.http
    //response.write("Todolist API");
    //response.end();

    //Baris ini memberi tahu client bahwa 
    // isi respons dari server berupa JSON.
    response.setHeader("Content-Type", "application/json")
    //- Jika GET, server memanggil fungsi getTodoList().
    // Fungsi tersebut mengambil data Todolist dan mengirimkannya 
    // kepada client. Contoh permintaan melalui test.http:
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

await service.loadTodoList();

server.listen(3003, () => {
    console.info("Server berjalan di port 3003");
});
