// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.
document.addEventListener("DOMContentLoaded", () =>{

//global variables 

const baseUrl = "http://localhost:3000/api/v1/calorie_entries/"
const body = document.querySelector("body")
const entriesList = document.querySelector("#calories-list")
const newCalorieEntryForm = document.querySelector("#new-calorie-form")
const caloriesField = newCalorieEntryForm.querySelector(".uk-input")
const notesField = newCalorieEntryForm.querySelector(".uk-textarea")
const editForm = document.querySelector("#edit-calorie-form")
const editCalorieField = editForm.querySelector(".uk-input")
const editNoteField = editForm.querySelector(".uk-textarea")
const bmrCalculatorForm = document.querySelector("#bmr-calulator")
const weightField = bmrCalculatorForm.querySelector("[placeholder='Weight (lbs)']")
const heighttField = bmrCalculatorForm.querySelector("[placeholder='Height (inches)']")
const ageField = bmrCalculatorForm.querySelector("[placeholder='Age (years)']")
const lowerBmrRange = document.querySelector("#lower-bmr-range")
const upperBmrRange = document.querySelector("#higher-bmr-range")
const progressBar = document.querySelector("progress")
let progressBarValue = 0


//request functions 

function get(url){
    return fetch(url)
    .then((response) => response.json())
}

function post(url,bodyOjbect){
    return fetch(url, {
        method:"POST",
        headers:{
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(bodyOjbect)
    }).then((response) => response.json())
}

function patch(url, id, bodyOjbect){
    return fetch(`${url}${id}`, {
        method: "PATCH",
        headers:{
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(bodyOjbect)
    }).then((response)=>response.json())
}

function destroy(url, id){
    return fetch(`${url}${id}`,{
        method:"DELETE"
    })
}

//functions 

function renderCalorieEntry(entry){
    const li = document.createElement("li")
    li.className = "calories-list-item"
    li.id = `entry-${entry.id}`
    const div1 = document.createElement("div")
    div1.className = "uk-grid"
    const div2 = document.createElement("div")
    div2.className = "uk-width-1-6"
    const strong = document.createElement("strong")
    strong.innerText = entry.calorie
    const span = document.createElement("span")
    span.innerText = "kcal"
    const div3 = document.createElement("div")
    div3.className = "uk-width-4-5"
    const em = document.createElement("em")
    em.innerText = entry.note 
    const div4 = document.createElement("div")
    const editLink = document.createElement("a")
    editLink.className = "edit-button"
    editLink.setAttribute("uk-icon", "icon: pencil")
    editLink.setAttribute("uk-toggle","target: #edit-form-container")
    editLink.addEventListener("click", () => showEditForm(entry))
    const deleteLink = document.createElement("a")
    deleteLink.className = "delete-button"
    deleteLink.setAttribute("uk-icon", "icon: trash")
    deleteLink.addEventListener("click",() => deleteEntry(entry))
    div4.append(editLink,deleteLink)
    div2.append(strong, span)
    div3.append(em)
    div1.append(div2, div3, div4)
    li.append(div1)
    entriesList.append(li)
    progressBarValue = progressBarValue + entry.calorie
    progressBar.value = progressBarValue
}

function getAllCalorieEntries(){
    get(baseUrl)
    .then((calorieEntries) => calorieEntries.forEach(renderCalorieEntry))
}

function createNewCalorieEntry(){
    event.preventDefault()

    bodyOjbect = {
        calorie: caloriesField.value, 
        note: notesField.value
    }

    post(baseUrl, bodyOjbect)
    .then(calorieEntry => renderCalorieEntry(calorieEntry))

    newCalorieEntryForm.reset()
}

function showEditForm(entry){
    editForm.style.display ="block"
    editCalorieField.value =  entry.calorie
    editNoteField.value = entry.note

    editForm.addEventListener("submit", () => updateEntry(entry))

}

function updateEntry(entry){
    event.preventDefault()

    progressBar.value -= entry.calorie
    
    bodyOjbect = {
        calorie: editCalorieField.value,
        note: editNoteField.value
    }

    patch(baseUrl, entry.id, bodyOjbect)
    .then((entry) => {
        const li = document.querySelector(`#entry-${entry.id}`)
        const caloriesDisplay = li.querySelector("strong")
        const noteDisplay = li.querySelector("em")
        caloriesDisplay.innerText = entry.calorie
        noteDisplay.innerText = entry.note
        progressBar.value += entry.calorie
    })
}

function hiddeEditForm(){
    if (event.target === editForm){
        editForm.style.display="none"
    }
}

function deleteEntry(entry){
    destroy(baseUrl, entry.id)
    .then(() => document.querySelector(`#entry-${entry.id}`).remove())
    .then(() => progressBar.value = progressBarValue - entry.calorie)
    
}

function bmrCalculator(){
    event.preventDefault()

    upperBmrRange.innerText = bmrUpperRange()
    lowerBmrRange.innerText = bmrLowerRange()
    progressBar.max = bmrAverage()
}

function bmrLowerRange(){
    let minBmr = `${Math.floor(655 + (4.35 * weightField.value) + (4.7 * heighttField.value) - (4.7 * ageField.value))}`
    return minBmr
}

function bmrUpperRange(){
    let maxBmr = `${Math.floor(66 + (6.23 * weightField.value) + (12.7 * heighttField.value) - (6.8 * ageField.value))}`
    return maxBmr
}

function bmrAverage(){
    let max = parseInt(bmrUpperRange())
    let min = parseInt(bmrLowerRange())
    let average = Math.floor((max + min)/2)
    return average
}

// mater functions and event listeners

    getAllCalorieEntries()

    newCalorieEntryForm.addEventListener("submit", createNewCalorieEntry)
    bmrCalculatorForm.addEventListener("submit", bmrCalculator)
    body.addEventListener("click", hiddeEditForm)
})


