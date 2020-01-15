// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.
document.addEventListener('DOMContentLoaded', function(){
    // HELPER APIS

    function get(URI) {
        return fetch(URI).then(response=>response.json())
    }

    function destroy(URI,id){
        let configObj = {
            method: "DELETE"
        }
        return fetch(`${URI}/${id}`,configObj).then(response=>response.json())
    }

    function post(URI,newObj){
        let configObj = {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
            },
            body: JSON.stringify(newObj)
        };
        return fetch(URI, configObj).then(response=>response.json())
    }

    function patch(URI,id,patchObj){
        let patchData = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(patchObj)
            };
            return fetch(`${URI}${id}`,patchData).then(response=>response.json())
    }

    // CONSTANTS, DECLERATIONS
    const BASE_URL_CALORIE_ENTRIES = "http://0.0.0.0:3000/api/v1/calorie_entries/"
    const CALORIES_LIST_UL = document.getElementById("calories-list")
    const NEW_CALORIE_FORM = document.getElementById("new-calorie-form")
    let PROGRESS_VALUE = 0 
    const PROGRESS_ELEMENT = document.querySelector(".uk-progress")
    const BMR_CALCULATOR = document.getElementById("bmr-calculator")
    const SPAN_LOWER_BMR_RANGE = document.getElementById("lower-bmr-range")
    const SPAN_HIGHER_BMR_RANGE = document.getElementById("higher-bmr-range")
    const EDIT_FORM = document.getElementById("edit-calorie-form")
    const editCalorieValue = EDIT_FORM.querySelector("input")
    const editNoteValue = EDIT_FORM.querySelector("textarea")

    // FUNCTIONS

    function allCalorieEntriesToPage(){
        get(BASE_URL_CALORIE_ENTRIES).then(addCalorieEntriesToPage)
    }

    function addCalorieEntriesToPage(allCalorieEntries){
        allCalorieEntries.forEach(addSingleEntryToPage)
    }

    function addSingleEntryToPage(oneEntry){
        let newLi = document.createElement('li')
        newLi.classList.add("calories-list-item")
        let newDivUkGrid = document.createElement('div')
        newDivUkGrid.classList.add("uk-grid")
        
        let newDivDivUkWidth1Dash6 = document.createElement('div')
        newDivDivUkWidth1Dash6.classList.add("uk-width-1-6")
        let newStrong = document.createElement('strong')
        newStrong.innerText = oneEntry.calorie
        let newSpan = document.createElement('span')
        newSpan.innerText = "kcal"
        newDivDivUkWidth1Dash6.append(newStrong,newSpan)

        let newDivDivUkWidth4Dash5 = document.createElement('div')
        newDivDivUkWidth4Dash5.classList.add("uk-width-4-5")
        let newEm = document.createElement('em')
        newEm.innerText = oneEntry.note
        newEm.classList.add("uk-text-meta")
        newDivDivUkWidth4Dash5.appendChild(newEm)

        newDivUkGrid.append(newDivDivUkWidth1Dash6,newDivDivUkWidth4Dash5)
        
        let newDIvListItemMenu = document.createElement('div')
        newDIvListItemMenu.classList.add('list-item-menu')
        //what's wrong here?
        let newAEditButton = document.createElement('a')
        newAEditButton.classList.add('edit-button')
        newAEditButton.setAttribute("uk-icon","icon: pencil")
        newAEditButton.setAttribute("uk-toggle","target: #edit-form-container")
        newAEditButton.addEventListener("click",()=>editEntryAndUpdatePage(oneEntry,newStrong,newEm))
        let newADeleteButton = document.createElement('a')
        newADeleteButton.classList.add('delete-button')
        newADeleteButton.setAttribute("uk-icon","icon: trash")
        newADeleteButton.addEventListener("click",()=>deleteEntryAndRemoveFromPage(oneEntry,newLi))

        newDIvListItemMenu.append(newAEditButton,newADeleteButton)

        newLi.append(newDivUkGrid,newDIvListItemMenu)
        PROGRESS_VALUE += oneEntry.calorie
        PROGRESS_ELEMENT.value = PROGRESS_VALUE
        CALORIES_LIST_UL.appendChild(newLi)

    }

    function editEntryAndUpdatePage(oneEntry,newStrong,newEm){
        editCalorieValue.value = oneEntry.calorie
        editNoteValue.value = oneEntry.note
        EDIT_FORM.addEventListener("submit",()=>patchAndUpdatePage(oneEntry,newStrong,newEm))
        debugger
    }

    function patchAndUpdatePage(oneEntry,newStrong,newEm){
        let patchObj = {
            calorie: editCalorieValue.value,
            note: editNoteValue.value
        }
        patch(BASE_URL_CALORIE_ENTRIES,oneEntry.id,patchObj).then(object=>function(object){
            newStrong.value = editCalorieValue.value
            newEm.value = editNoteValue.value
            PROGRESS_VALUE = PROGRESS_VALUE - oneEntry.calorie + editCalorieValue.value
            PROGRESS_ELEMENT.value = PROGRESS_VALUE
        })
    }

    function postANewCalorieIntakeAndRenderToPage(event){
        event.preventDefault()
        let calorieEntered = NEW_CALORIE_FORM.querySelector(".uk-input").value
        let noteEntered = NEW_CALORIE_FORM.querySelector(".uk-textarea").value
        let objectToSend = {
            calorie: calorieEntered,
            note: noteEntered
        }
        post(BASE_URL_CALORIE_ENTRIES,objectToSend).then(addSingleEntryToPage)
    }

    function deleteEntryAndRemoveFromPage(oneEntry,newLi){
        //IMPROVEMENT OPPORTUNITY: Decrease the value AFTER the delete is successful
        PROGRESS_VALUE -= oneEntry.calorie
        PROGRESS_ELEMENT.value = PROGRESS_VALUE
        destroy(BASE_URL_CALORIE_ENTRIES,oneEntry.id).then(newLi.remove())
    }

    function calculateBMR(){
        event.preventDefault()
        let allInputItemsInTheForm = BMR_CALCULATOR.querySelectorAll(".uk-input")
        let weight = allInputItemsInTheForm[0].value
        let height = allInputItemsInTheForm[1].value
        let age = allInputItemsInTheForm[2].value
        let minimum = 655+(4.35*weight)+(4.7*height)-(4.7*age)
        let maximum = 66+(6.23*weight)+(12.7*height)-(6.8*age)
        SPAN_LOWER_BMR_RANGE.innerText = minimum
        SPAN_HIGHER_BMR_RANGE.innerText = maximum
        PROGRESS_ELEMENT.max = (0.5)*(maximum+minimum)
    }

    // INDEPENDENT EVENTLISTENERS, INITIAL LOADERS
    allCalorieEntriesToPage()

    NEW_CALORIE_FORM.addEventListener("submit",postANewCalorieIntakeAndRenderToPage)
    BMR_CALCULATOR.addEventListener("submit",calculateBMR)

})