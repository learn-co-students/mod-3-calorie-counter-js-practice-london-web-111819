// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.

document.addEventListener('DOMContentLoaded', () => {
    
    // constants

    const baseURI = 'http://0.0.0.0:3000/api/v1/calorie_entries/'
    const calorieList = document.querySelector('#calories-list')
    const newCalorieForm = document.querySelector('#new-calorie-form')
    const progressBar = document.querySelector('progress')
    const editModal = document.querySelector('.uk-modal-dialog')
    let calorieSum = 0
    const bmrForm = document.querySelector('#bmr-calulator')
    const editForm = document.querySelector('#edit-calorie-form')

    // api

    function get(url) {
        return fetch(url).then(resp => resp.json())
    }

    function post(url, bodyObject) {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(bodyObject)
        }).then(resp => resp.json())
    }

    function destroy(url, id) {
        fetch(url + id, {
            method: "DELETE"
        }).then(resp => resp.json())
    }

    function patch(url, id, bodyObject) {
        fetch(url + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(bodyObject)
        }).then(resp => resp.json())
    }
    // functions

    function createListItem(entry) {
        const li = document.createElement('li')
        li.id = entry.id
        li.classList.add('calories-list-item')

        const gridDiv = document.createElement('div')
        gridDiv.classList.add('uk-grid')

        const colDiv = document.createElement('div')
        colDiv.classList.add('uk-width-1-6')

        const strong = document.createElement('strong')
        strong.textContent = entry.calorie

        const span = document.createElement('span')
        span.textContent = 'kcal'

        const wideDiv = document.createElement('div')
        wideDiv.classList.add('uk-width-4-5')

        const em = document.createElement('em')
        em.classList.add('uk-text-meta')
        em.textContent = entry.note

        const menuDiv = document.createElement('div')
        menuDiv.classList.add('list-item-menu')

        const editBtn = document.createElement('a')
        editBtn.classList.add('edit-button')
        editBtn.setAttribute('uk-toggle', 'target: #edit-form-container')
        editBtn.setAttribute('uk-icon', 'icon: pencil')
        editBtn.addEventListener('click', () => {
            document.querySelector('#edit-calorie-form').children[1].children[0].children[0].placeholder = `${entry.calorie} kcal`
            document.querySelector('#edit-calorie-form').children[1].children[1].children[0].placeholder = entry.note
            document.querySelector('#edit-calorie-form').children[1].children[1].children[0].id = entry.id
        })

        const delBtn = document.createElement('a')
        delBtn.classList.add('delete-button')
        delBtn.setAttribute('uk-icon', 'icon: trash')
        delBtn.addEventListener('click', () => {
            deleteThenRemoveLi(entry.id, li)
            calorieSum -= entry.calorie
            calcCalories(calorieSum)
        })

        gridDiv.append(colDiv, wideDiv)
        colDiv.append(strong, span)
        wideDiv.append(em)

        menuDiv.append(editBtn, delBtn)

        li.append(gridDiv, menuDiv)

        calorieList.append(li)
        calorieSum += entry.calorie
        calcCalories(calorieSum)
    }

    function getThenRenderEntries() {
        get(baseURI).then(entries => entries.forEach(createListItem))
    }

    function postToCaloriesThenRender(event) {
        event.preventDefault()
        let bodyObject = {
            calorie: event.target.children[1].children[0].firstElementChild.value,
            note: event.target.children[1].children[1].firstElementChild.value
        }
        post(baseURI, bodyObject).then((entry) => {
            createListItem(entry)
        })
        
    }

    function deleteThenRemoveLi(id, li) {
        destroy(baseURI, id)
        li.remove()
    }

    function calcCalories(calorieSum) {
        // ratio = calorieSum / calorieRange()
        progressBar.value = calorieSum
    }

    function calorieRange() {
        return parseInt(document.querySelector('#lower-bmr-range').textContent) + parseInt(document.querySelector('#higher-bmr-range').textContent) / 2
    }

    function calculateBMR(event) {
        event.preventDefault()
        let weight = event.target.children[1].firstElementChild.value
        let height = event.target.children[2].firstElementChild.value
        let age = event.target.children[3].firstElementChild.value
        document.querySelector('#lower-bmr-range').textContent = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age)
        document.querySelector('#higher-bmr-range').textContent = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age)
        let min = parseInt(655 + (4.35 * weight) + (4.7 * height) - (4.7 * age))
        let max = parseInt(66 + (6.23 * weight) + (12.7 * height) - (6.8 * age))
        let progMax = (min + max) / 2
        progressBar.max = progMax
    }

    function patchToCalories(e) {
        e.preventDefault()
        let bodyObject = {
            calorie: document.querySelector('#edit-calorie-form').children[1].children[0].children[0].value,
            note: document.querySelector('#edit-calorie-form').children[1].children[1].children[0].value
        }
        patch(baseURI, document.querySelector('#edit-calorie-form').children[1].children[1].children[0].id, bodyObject)
    }

    getThenRenderEntries()

    // event listeners

    newCalorieForm.addEventListener('submit', postToCaloriesThenRender)
    bmrForm.addEventListener('submit', calculateBMR)
    editForm.addEventListener('submit', patchToCalories)

})
