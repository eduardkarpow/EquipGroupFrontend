
const id = Number(window.location.search.split('=')[1]);
console.log(id);

const setupInfo = (data) => {
    console.log(data);
    $(".name")[0].innerHTML = data[0].name;
    $(".price")[0].innerHTML += " " + data[0].price.price;
}

const renderBreadcrumbs = (breadcrumbs) => {
    const rootElement = $(".breadcrumbs")[0];
    for(let breadcrumb of breadcrumbs) {
        const container = document.createElement('div');
        container.innerHTML = `→<a href="index.html?id=${breadcrumb.id}">${breadcrumb.name}</a>`;
        rootElement.appendChild(container);
    }
}

fetch(`http://localhost:8000/getProductInfo?id=${id}`, {
    method: "GET"
})
.then(res => res.json())
.then(data => setupInfo(data));

fetch(`http://localhost:8000/getBreadcrumbs?id=${id}`, {
    method: "GET"
})
.then(res => res.json())
.then(data => renderBreadcrumbs(data));