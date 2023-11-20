document.addEventListener("DOMContentLoaded", async function () {
    const formulier = document.getElementById("vragenFormulier");

    try {
        const response = await fetch("questions.json");
        const data = await response.json();
        window.questions = data;

        data.forEach((vraag, index) => {
            const vraagElement = createQuestionElement(vraag, index);
            formulier.querySelector(".vragen").appendChild(vraagElement);
        });
    } catch (error) {
        console.error("Fout bij het inladen van het JSON-bestand:", error);
    }
});

function createQuestionElement(vraag, index) {
    const vraagElement = document.createElement("div");
    vraagElement.classList.add("vraag", "mb-10");
    vraagElement.setAttribute("vraagnum", index + 1);

    const vraagTekst = document.createElement("p");
    vraagTekst.classList.add("text-lg", "font-semibold");
    vraagTekst.textContent = `${index + 1}) ${vraag.vraag}`;
    vraagElement.appendChild(vraagTekst);

    const toggleButton = createToggleButton();
    vraagElement.appendChild(toggleButton);

    const vraagUitleg = createQuestionExplanation(vraag.informatie);
    vraagElement.appendChild(vraagUitleg);

    const antwoordContainer = createAnswerContainer(vraag, index);
    vraagElement.appendChild(antwoordContainer);

    return vraagElement;
}

function createToggleButton() {
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.classList.add("toggle-button", "text-sm", "text-gray-500", "border", "border-gray-300", "rounded", "px-2", "py-1");
    toggleButton.textContent = "Toelichting";
    toggleButton.addEventListener("click", function () {
        const toggleContent = toggleButton.nextElementSibling;
        toggleContent.style.display = (toggleContent.style.display === "none") ? "block" : "none";
    });

    return toggleButton;
}

function createQuestionExplanation(informatie) {
    const vraagUitleg = document.createElement("p");
    vraagUitleg.classList.add("text-sm", "text-gray-500");
    vraagUitleg.textContent = informatie;

    const toggleContent = document.createElement("div");
    toggleContent.classList.add("toggle-content");
    toggleContent.style.display = "none";
    toggleContent.appendChild(vraagUitleg);

    return toggleContent;
}

function createAnswerContainer(vraag, index) {
    const antwoordContainer = document.createElement("div");
    antwoordContainer.classList.add("antwoorden", "md:space-x-4", "flex", "flex-wrap", "justify-center", "text-center", "md:justify-start", "md:flex-none", "md:text-start"); // Add these classes

    vraag.antwoorden.forEach((antwoord, antwoordIndex) => {
        const antwoordInput = createAnswerInput(index, antwoordIndex, antwoord.waarde);
        const antwoordLabel = createAnswerLabel(index, antwoordIndex, antwoord.tekst);

        antwoordContainer.appendChild(antwoordInput);
        antwoordContainer.appendChild(antwoordLabel);
    });

    return antwoordContainer;
}

function createAnswerInput(index, antwoordIndex, waarde) {
    const antwoordInput = document.createElement("input");
    antwoordInput.setAttribute("type", "radio");
    antwoordInput.setAttribute("id", `antwoord_${index}_${antwoordIndex}`);
    antwoordInput.setAttribute("name", `vraag_${index}`);
    antwoordInput.setAttribute("value", waarde);
    antwoordInput.classList.add(`peer/${antwoordIndex}`, "hidden", "md:inline-block");
    antwoordInput.addEventListener("change", function () {
        clearResultAndErrors();
    });

    return antwoordInput;
}

function createAnswerLabel(index, antwoordIndex, tekst) {
    const antwoordLabel = document.createElement("label");
    antwoordLabel.setAttribute("for", `antwoord_${index}_${antwoordIndex}`);
    antwoordLabel.textContent = tekst;
    antwoordLabel.classList.add("hover:bg-gray-100", `peer-checked/${antwoordIndex}:bg-gray-200`, "px-2", "py-1", "rounded", "cursor-pointer");

    return antwoordLabel;
}

function clearResultAndErrors() {
    const result = document.getElementById("result");
    result.classList.add("opacity-0");
    document.getElementById("partijen").innerHTML = "";
    document.getElementById("errors").textContent = "";
}

async function submitFormulier() {
    const formulier = document.getElementById("vragenFormulier");
    const result = document.getElementById("result");

    const vraagObjects = Array.from(formulier.getElementsByClassName("vraag"));
    let antwoordValues = [];
    let cancel = false;

    for (const vraag of vraagObjects) {
        const antwoord = vraag.querySelector('input[type="radio"]:checked');
        const errors = document.getElementById("errors");
        errors.textContent = "";
        if (antwoord == null) {
            errors.textContent = `Vraag ${vraag.getAttribute("vraagnum")} is niet beantwoord!`;
            result.classList.add("opacity-0");
            cancel = true;
            break; // Break after encountering an error
        } else {
            antwoordValues.push(parseInt(antwoord.value));
        }
    }

    if (!cancel) {
        const totalScore = antwoordValues.reduce((sum, value) => sum + value, 0);
        const closeParties = await calculateCloseness(totalScore);
        displayResults(closeParties);
    }
}

async function calculateCloseness(totalScore) {
    // Fetch the parties data
    const response = await fetch("parties.json");
    const parties = await response.json();

    // Map each party's name with the absolute difference of their position and the total score
    const closenessScores = parties.map(party => ({
        name: party.name,
        closeness: Math.abs(party.score - totalScore)
    }));

    // Sort the parties based on closeness to the user's score
    closenessScores.sort((a, b) => a.closeness - b.closeness);

    return closenessScores;
}

function displayResults(closeParties) {
    const result = document.getElementById("result");
    const partyelement = document.getElementById("partijen");
    partyelement.innerHTML = "";

    closeParties.forEach((party, index) => {
        const partyElement = document.createElement("li");
        partyElement.textContent = `${index + 1}) ${party.name}`;
        partyelement.appendChild(partyElement);
    });

    result.classList.remove('opacity-0');
    window.scrollTo(result.offsetLeft, result.offsetTop);
    console.log(closeParties);
}

document.getElementById("send").addEventListener("click", submitFormulier);
