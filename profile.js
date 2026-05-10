const logoutBtn = document.querySelector("#logoutBtn");

const logout = () => {
    localStorage.clear();
    location.reload();
};

let readingListData = [];
let ratedBooksData = [];

const getReadingList = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // If not logged in
    if(!token || !user) {
        window.location.href = "index.html";
        return;
    }

    const response = await axios.get(`http://localhost:1337/api/users/${user.id}?populate=readingList.image`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    readingListData = response.data.readingList || [];

    renderReadingList(readingListData);
};

const getRatedBooks = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await axios.get(`http://localhost:1337/api/ratings?filters[user][id][$eq]=${user.id}&populate=book.image`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    ratedBooksData = response.data.data;

    renderRatedBooks(ratedBooksData);
};

// Render the list 
const renderReadingList = (list) => {
    const container = document.querySelector("#reading-list");

    container.innerHTML = "";

    list.forEach(book => {
        const imageUrl = book.image?.length > 0
            ? "http://localhost:1337" + book.image[0].url
            : "";

        container.innerHTML += `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <img src="${imageUrl}" width="80">
            <button onclick="removeBook(${book.id})">Remove</button>
        </div>
        `;
    });
};

const removeBook = async (bookId) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    //remove from array
    const updatedList = readingListData
        .filter(book => book.id !== bookId)
        .map(book => book.id);
    
    await axios.put(`http://localhost:1337/api/users/${user.id}`,
        {
            readingList: updatedList
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    getReadingList();
};

// Sort title
const sortByTitle = () => {
    const sorted = [...readingListData].sort((a, b) =>
        a.title.localeCompare(b.title)
    );

    renderReadingList(sorted);
};

// Sort author
const sortByAuthor = () => {
    const sorted = [...readingListData].sort((a, b) =>
        a.author.localeCompare(b.author)
    );

    renderReadingList(sorted);

};

logoutBtn.addEventListener("click", logout);

getReadingList(); // Calling