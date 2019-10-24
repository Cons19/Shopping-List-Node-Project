const createForm = document.getElementById("createForm");
const updateForm = document.getElementById("updateForm");
const shoppingListTable = document.getElementById("shoppingListTable");
const clearAllBtn = document.getElementById("clearAll");
const table = document.createElement("table");
table.id = "listTable";
let deleted = false;
let updated = false;

let row = table.insertRow();
const itemHeader = row.insertCell();
itemHeader.innerHTML = "<b>Item</b>";
const quantityHeader = row.insertCell();
quantityHeader.innerHTML = "<b>Quantity</b>";
const deleteHeader = row.insertCell();
deleteHeader.innerHTML = "";

function newRow(item, quantity) {
    row = table.insertRow();
    const itemCell = row.insertCell();
    itemCell.innerHTML = item;
    itemCell.className = "itemCell";
    const quantityCell = row.insertCell();
    quantityCell.innerHTML = quantity;
    const deleteAndUpdateCell = row.insertCell();
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "Delete Item";
    deleteBtn.className = "normalButton";
    deleteBtn.setAttribute('onclick', 'removeRow(this)');
    const updateBtn = document.createElement("button");
    updateBtn.innerHTML = "Update Item";
    updateBtn.className = "normalButton";
    updateBtn.setAttribute('onclick', 'updateRow(this)');
    deleteAndUpdateCell.appendChild(deleteBtn);
    deleteAndUpdateCell.appendChild(updateBtn);
}

shoppingListTable.appendChild(table);

function getAllElements() {
    try {
        axios.get('/getAll').then((result) => {
            if(result.data.status === 200) {

                result.data.list.sort(function(a, b) {
                    var textA = a.item;
                    var textB = b.item;
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });

                result.data.list.forEach((element) => {
                    newRow(element.item, element.quantity);
                });
                
            } 
        }).catch(e => {
            console.log('error: ', e);
        });
   
    } catch (error) {
        console.log('error', error);  
    }
}

createForm.addEventListener("submit", (e) => {
    // let the function run and not refresh the page as it is by default
    e.preventDefault();

    $('#createMessage').empty();

    let list ={
        item: '',
        quantity:''
    }

    
    try {
        list.item = $('input[name="item"]').val()
        list.quantity = $('input[name="quantity"]').val()

        console.log('list: ', list);
        
        axios.post('/create', list).then((result) => {
            console.log('result: ', result);

            if(result.data.status === 201) {

                $('#createMessage').append(`${result.data.message}`);
                newRow(result.data.list.item, result.data.list.quantity);
                location.reload();
                
            } else if(result.data.status === 400) {
                if(deleted === false && updated === false) {
                    $('#createMessage').append(`${result.data.message}`);
                } else {
                    deleted = false;
                    updated = false;
                }
            } else if(result.data.status === 405) {
                if(deleted === false && updated === false) {
                    $('#createMessage').append(`${result.data.message}`);
                } else {
                    deleted = false;
                    updated = false;
                }
            }
        }).catch(e => {
            console.log('error: ', e);
        });
   
    } catch (error) {
        console.log('error', error);  
    }
   
    shoppingListTable.appendChild(table);
    createForm.reset();
});

function removeRow(button) { 
    deleted = true;
    
    try {
        let deletedItem;
        for(var i = 1; i < table.rows.length; i++)
        {
            table.rows[i].onclick = function() {
                console.log(this.cells[0].innerHTML);
                deletedItem = this.cells[0].innerHTML;
                console.log('deleted item: ', deletedItem);
                let confirmation = confirm(`Are you sure you want to delete ${deletedItem} from the shopping list?`);
                if (confirmation === true) {
                    axios.delete(`/delete/${deletedItem}`).then((result) => {
                        console.log('result: ', result);
                        console.log('result.data: ', result.data);
                        if(result.data.status === 200) {
                            table.deleteRow(button.parentNode.parentNode.rowIndex);
                        } 
                    }).catch(e => {
                        console.log('error: ', e);
                    });
                }
            };
        } 
    } catch (error) {
        console.log('error', error);  
    }
}

function updateRow() {
    $('#updateMessage').empty();
    updated = true;
    document.getElementById("updatedItem").setAttribute("value", "");
    document.getElementById("updatedQuantity").setAttribute("value", "");

    try {
        let oldItem;
        let oldQuantity;
        for(var i = 1; i < table.rows.length; i++)
        {
            table.rows[i].onclick = function() {
                oldItem = this.cells[0].innerHTML;
                oldQuantity = this.cells[1].innerHTML;
                console.log('old item: ', oldItem);
                console.log('old quantity: ', oldQuantity);
                
                // add to the inputs the currents values of the elements

                document.getElementById("updatedItem").setAttribute("value", oldItem);
                document.getElementById("updatedQuantity").setAttribute("value", oldQuantity);
        
                updateForm.addEventListener("submit", (e) => {
                    // let the function run and not refresh the page as it is by default
                    e.preventDefault();
                    $('#updateMessage').empty();

                    let list ={
                        item: '',
                        quantity:''
                    }
                
                    try {
                        list.item = $('input[name="updatedItem"]').val()
                        list.quantity = $('input[name="updatedQuantity"]').val()
                
                        console.log('list: ', list);
                        
                        axios.put(`/update/${oldItem}`, list).then((result) => {
                            console.log('result: ', result);
                            console.log('result.data: ', result.data);
                            document.getElementById("updatedItem").setAttribute("value", list.item);
                            document.getElementById("updatedQuantity").setAttribute("value", list.quantity);
                            if(result.data.status === 200) {
                                $('#updateMessage').append(`${result.data.message}`);
                                
                                setTimeout(() => {
                                    location.reload();
                                }, 1000);
                            } else if(result.data.status === 400) {
                                $('#updateMessage').append(`${result.data.message}`);
                            }
                        }).catch(e => {
                            console.log('error: ', e);
                        });
                   
                    } catch (error) {
                        console.log('error', error);  
                    }

                    shoppingListTable.appendChild(table);
                    updateForm.reset();
                    
                });
            };
        } 
    } catch (error) {
        console.log('error', error);  
    }
    shoppingListTable.appendChild(table);
    updateForm.reset();
}

clearAllBtn.addEventListener("click", (e) => { 
    e.preventDefault();

    try {
        let confirmation = confirm(`Are you sure you want to delete all the elements from the shopping list?`);
        if (confirmation === true) {
            axios.delete('/deleteAll').then((result) => {
                console.log('result: ', result);
                console.log('result.data: ', result.data);
                if(result.data.status === 200) {
                    location.reload();
                } 
            }).catch(e => {
                console.log('error: ', e);
            });
        }
   
    } catch (error) {
        console.log('error', error);  
    }

});
