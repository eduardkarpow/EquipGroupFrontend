const GroupsSearchTree = {}
const FlatedTree = {};
let sortPrice = 0;
let sortName = 0;
let AmountOfProducts = 0;
let currentPage = 0;
let Groups = [];

const setSortPriceIncreasing = () => {
    setSortByPrice(1);
}
const setSortPriceDecreasing = () => {
    setSortByPrice(-1);
}

const setNameIncreasing = () => {
    setSortByName(1);
}
const setNameDecreasing = () => {
    setSortByName(-1);
}

const getSortQuery = () => {
    if (sortName !== 0) {
        return sortName === 1 ? '&order=name_inc' : '&order=name_dec';
    }
    if (sortPrice !== 0) {
        return sortPrice === 1 ? '&order=price_inc' : '&order=price_dec';
    }
    return '';
}

const prepareBaseGetProductsQuery = () => {
    return `http://localhost:8000/getProducts?page=${currentPage}&limit=10`;
}

const buildGetProductQuery = () => {
    let baseQuery = `http://localhost:8000/getProducts?page=${currentPage}&limit=10`;
    const sortQuery = getSortQuery();
    let groupsQuery = createGroupsQuery();
    groupsQuery = groupsQuery ? '&' + groupsQuery : '';
    return baseQuery + sortQuery + groupsQuery;
}


const setSortByPrice = (value) => {
    sortPrice = value;
    if (value !== 0) sortName = 0;

    fetchProducts(buildGetProductQuery());
}

const setSortByName = (value) => {
    sortName = value;
    if (value !== 0) sortPrice = 0;

    fetchProducts(buildGetProductQuery());
}

const changePage = (event) => {
    event.stopPropagation();
    const target = event.target;
    currentPage = Number(target.id.split("-")[1]);

    fetchProducts(buildGetProductQuery());
}


const prepareGroupsData = (data) => {
    for (let group of data) {
        const groupPrepared = { 'count': group.products_count, 'name': group.name, 'id': group.id, 'parentId': group.id_parent, 'childs': {} };
        if (group.id_parent === 0) {
            GroupsSearchTree[group.id] = groupPrepared;
            FlatedTree[group.id] = groupPrepared;
        } else {
            FlatedTree[group.id_parent].childs[group.id] = groupPrepared;
            FlatedTree[group.id] = groupPrepared;
        }
    }
    prepareCounts(GroupsSearchTree)
    if(window.location.search) {
        renderNewGroupsList(Number(window.location.search.split('=')[1]), false);
    } else {
        renderNewGroupsList(1, true);
    }
}

const prepareCounts = (nodes) => {
    let sum = 0;
    for (let node of Object.values(nodes)) {
        if (node.childs) {
            node.count = node.count + prepareCounts(node.childs);
            sum += node.count;
        } else {
            return node.count
        }
    }
    return sum;
}

const toggleGroup = (event) => {
    event.stopPropagation();
    const target = event.target;
    const id = Number(target.id.split("-")[1]);
    renderNewGroupsList(id, false);
}

const createLIForgroupsList = (element, active) => {
    let li = document.createElement('li');
    li.classList.add('groups__element');
    if (active) li.classList.add('active');
    li.id = `groups__element-${element.id}`;
    li.innerText = `${element.name} (${element.count})`;
    li.addEventListener('click', toggleGroup);
    return li;
}

const getGroups = (id) => {
    Groups = [];
    const availableNodes = [FlatedTree[id]];
    while (availableNodes.length) {
        let currentNode = availableNodes.pop();
        Groups.push(currentNode.id);
        if(currentNode.childs) {
            availableNodes.push(...Object.values(currentNode.childs));
        }
    }
}

const renderNewGroupsList = (id, isZero) => {
    let current = FlatedTree[id];
    let activeElement = createLIForgroupsList(current, true);

    if(current.childs && !isZero) {
        const ul = document.createElement('ul');
        for(let child of Object.values(current.childs)) {
            const li = createLIForgroupsList(child, false);
            ul.appendChild(li);
        }
        activeElement.appendChild(ul);
    }

    
    
    while (current.parentId !== 0) {
        const parent = FlatedTree[current.parentId];
        const ul = document.createElement('ul');
        for (let child of Object.values(parent.childs)) {
            if (child.id === current.id) {
                ul.appendChild(activeElement);
            } else {
                let li = createLIForgroupsList(child, false);
                ul.appendChild(li);
            }
        }
        let parentLI = createLIForgroupsList(parent, true);
        parentLI.appendChild(ul);
        activeElement = parentLI;
        current = parent;
    }
    const ul = $('.root')[0]
    ul.innerHTML = '';
    if(isZero) activeElement.classList.remove('active');
    for (let child of Object.values(GroupsSearchTree)) {
        if (child.id === current.id) {
            ul.appendChild(activeElement);
        } else {
            let li = createLIForgroupsList(child, false);
            ul.appendChild(li);
        }
    }

    if(!isZero) getGroups(id);
    fetchProducts();
}

const renderProductsList = (products) => {
    const $products_list = $(".products__list")[0];
    $products_list.innerHTML = '';
    for (let product of products) {
        $product_element = document.createElement('div');
        $product_element.classList.add('products__element');
        $product_element.innerHTML = `<a href="product.html?id=${product.id_product}"=>${product.name}</a> ${product.price}`;

        $products_list.appendChild($product_element);
    }
}

const createGroupsQuery = () => {
    if (!Groups.length) return;
    query = "groups[]=" + Groups.join("&groups[]=");

    return query;
}

const renderPagination = () => {
    const countPages = Math.ceil(AmountOfProducts / 10);

    const pagination = $(".pagination")[0];
    pagination.innerHTML = "Страница";
    for (let i = 0; i < countPages; i++) {
        const h4 = document.createElement('h4');
        h4.innerText = i + 1;
        h4.id = `page-${i}`;
        h4.addEventListener('click', changePage);
        pagination.appendChild(h4);
    }
}

const fetchProducts = (query) => {
    groupsQuery = createGroupsQuery();
    fetch(buildGetProductQuery(), {
        method: "GET"
    })
        .then(res => res.json())
        .then(data => renderProductsList(data));
    const amountOfProductsQuery = groupsQuery ? '?' + groupsQuery : '';
    fetch("http://localhost:8000/getAmountOfProducts" + amountOfProductsQuery, {
        method: "GET"
    })
        .then(res => res.json())
        .then(data => {
            AmountOfProducts = data;
            renderPagination();
            return;
        })
}

fetch("http://localhost:8000/getGroups", {
    method: "GET"
})
    .then(res => res.json())
    .then(data => prepareGroupsData(data));

fetchProducts(prepareBaseGetProductsQuery());

$('#price_inc')[0].addEventListener('click', setSortPriceIncreasing);
$('#price_dec')[0].addEventListener('click', setSortPriceDecreasing);
$('#name_inc')[0].addEventListener('click', setNameIncreasing);
$('#name_dec')[0].addEventListener('click', setNameDecreasing);

