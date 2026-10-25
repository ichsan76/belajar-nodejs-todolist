
//document.getElementById()	Mengambil elemen HTML berdasarkan ID.
const todoList = document.getElementById("todo-list");
const message = document.getElementById("message");
//digunakan untuk mendeteksi saat pengguna mengirim form.
const todoForm =document.getElementById("todo-form");
//digunakan untuk mengambil teks yang dimasukkan pengguna.
const todoInput = document.getElementById("todo-input");

//mengambil data todo dari REST API
async function getTodoList(){

    try{ //fetch()	Mengirim permintaan HTTP ke backend.
        const response = await fetch("http://localhost:3003");

        console.log("Response status:", response.status);

        //await response.json()	Mengubah respons JSON menjadi objek JavaScript.
        const result = await response.json();

        console.log("Data dari API:", result);

        //menghapus tampilan sebelumnya
        todoList.innerHTML = "";

        //menampilkan data todo atau Mengulangi setiap data todo yang diterima.
        //forEach=untukSetiap
        result.data.forEach((todo) => {
            //Membuat elemen daftar untuk setiap todo.
            const li = document.createElement("li")

            //membuat elemen untuk menampilkan teks todo
            //span agar kita bisa menempatkan teks dan tombol Edit sebagai dua elemen terpisah dalam satu daftar.
            const span = document.createElement("span");
            span.textContent = todo.todo;

            //membuat tombol edit
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "edit";
            
            editButton.addEventListener("click", () => {
                updateTodo(todo.id, todo.todo);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete"

            deleteButton.addEventListener("click", () => {
                deleteTodo(todo.id, todo.todo);
            });

            //menjalankan fungsi edit ketika tombol diklik
            //ketika pengguna menekan tombol Edit, JavaScript memanggil
            //  fungsi updateTodo() dengan ID dan teks todo yang dipilih.
            //1.editButton.addEventListener("click", () => {
                //1.updateTodo(todo.id, todo.todo);
            //1/});

            //memasukkan teks dan tombol ke dalam daftar
            li.appendChild(span);
            li.appendChild(editButton);
            li.appendChild(deleteButton);

            //memasukan daftar ke halaman HTML
            //kepakai pas sblm ada update. todoList.appendChild(li);


            //kepakai pas sblm ada update. li.textContent = todo.todo;


            //Memasukkan todo ke halaman HTML.
            todoList.appendChild(li);
        });
    } catch (error) {
        message.textContent = "Gagal mengambil data todo";
        console.error(error);
    }

}
//menjalankan fungsi ketika halaman dibuka
//getTodoList();

async function createTodo(todo) {
    try {
        const response = await fetch("http://localhost:3003",{
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                todo: todo
            })
        });

        const result = await response.json();

        //memberikan apakah backend mengembalikan status berhasil.
        if(!response.ok) {
            message.textContent =
                result.message || "Gagal menambahkan todo";

            return;
        }

        //menampilkan pesan ketika todo berhasi ditambahkan.
        message.textContent = "Todo berhasil ditambahkan";

        //memgosongkan input setelah berhasil.
        todoInput.value = "";

        //mengambil ulang daftar todo dari backend.
        await getTodoList();
    } catch (error) {
        message.textContent = "Gagal terhubung ke server";

        console.error(error);
    }
} 

async function updateTodo(id, currentTodo) {
    //meminta pennguna memasukkan teks todo yang baru
    const newTodo = prompt("Ubah todo", currentTodo);

    //jika pengguna menekan cancel, batalkan prosess
    if (newTodo === null) {
        return;
    }

    //menghapus spasi di awal dan akhir teks.
    const todo = newTodo.trim();

    //memastikan teks tidak kosong
    if (todo === ""){
        message.textContent = "Todo tidak boleh kosong";
        return;
    }
    
    try {
        //mengirim permintaan PUT ke backend
        const response = await fetch(`http://localhost:3003/${id}`,{
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                todo: todo
            })
        });

        //mengubah respons JSON menjadi objek JavaScript
        const result = await response.json();

        if(!response.ok) {
            message.textContent =
                result.message || "Gagal memperbarui todo";

            return;
        }

        //menampilkan pesan jika berhsil
        message.textContent = "Todo berhasil diperbarui";

        //mengambil ulang daftar todo terbaru
        await getTodoList();
    } catch (error) {
        message.textContent = "Gagal terhubung ke server";
        console.error(error);
    }

}

async function deleteTodo(id, currentTodo) {
    //Meminta konfirmasi sebelum menghapus
    const confirmDelete = confirm(
        `Apakah kamu yakin ingin menghapus todo "${currentTodo}"`
    );
    
    if(!confirmDelete) {
        return;
    }

    try {
        //Mengirim permintaan HTTP DELETE
        const response = await fetch(`http://localhost:3003/${id}`,{
            method: "DELETE"
        });
        //Membaca respons dari backend
        const result = await response.json();

        if (!response.ok){
            message.textContent =
                result.message || "Gagal menghapus todo";
            return;
        }

        //Memperbarui tampilan setelah penghapusan
        message.textContent = "Todo berhasil dihapus";

        await getTodoList();


    } catch (error) {
        error.textContent = "Gagal terhubung ke server";
        console.error(error);
    }
    
}

//menangani pengiriman form ketika tombol tambah ditekan
todoForm.addEventListener("submit", async function (event) {
    //mencegah browser memuat ulang halaman secara otomatis.
    event.preventDefault();

    //mengambil teks dan menghapus spasi di awal serta akhir.
    const todo = todoInput.value.trim();

    //memastikan input tidak kosong.
    if (todo === "") {
        message.textContent = "Todo tidak boleh kosong";
        return;
    }

    //mengirim todo ke backend
    await createTodo(todo);
});

//mulai update

//menjalankan fungsi ketika halaman dibuka
getTodoList();