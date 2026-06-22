async function cerca(){
 var input = document.getElementById("searchInput").value;
 if(input){
    try {

        document.querySelector(".loader").style.display = "block";
        document.getElementById("results").innerHTML = "";

        var response = await fetch("https://www.cheapshark.com/api/1.0/games?title=" + input);
        const data = await response.json();
        let html = "";

        if(data.length < 1){
            html += "<div class='notfound'>Nessun gioco trovato</div>";
            document.getElementById("results").innerHTML = html;
        } else {
            data.forEach(game => {
                html += "<div class='game' style=color:white;>";
                html += "<img src=" + game.thumb + " class=\"thumb\">";
                html += "<a href=\"https://www.cheapshark.com/redirect?dealID=" + game.cheapestDealID + "\" class=\"title\" target=\"_blank\"; style = color:white;>" + game.external + "</a>";
                html += "<p class=\"price\">Prezzo: " + "€" + game.cheapest + "</p>";
                html += "<div class=\"popup\" onclick=\"clickGioco("+ game.gameID + ")\";>Visualizza dettagli";
                html += "</div>";
                html += "</div>";
            });
            console.log(data);
            document.getElementById("results").innerHTML = html;
        }
    } catch (exceptionVar) {
        console.error("Errore nella ricerca:", exceptionVar);
        alert("Errore nella ricerca. Riprova.");
        document.getElementById("results").innerHTML = "";
    } finally {
        document.querySelector(".loader").style.display = "none";
    }
 } else{
    document.getElementById("results").innerHTML = "";
 }
}

function clickGioco(id){
    window.open("dettagli.html?id=" + id, "_blank");
}

var s = document.getElementById("searchInput");
if(s)
s.addEventListener("keyup", function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        cerca();
    }
});

//

// Funzione per popolare la pagina dei dettagli del gioco
async function popolaPagina(){
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get('id');
    if(!id){return;}


    var response = await fetch("https://www.cheapshark.com/api/1.0/games?id=" + id);
    const data = await response.json();


// Contiene la lista dei negozi
    const stores = getStores();
    if(data.length < 1){
        html += "<div class='notfound'>Nessun gioco trovato</div>"; // Mostrato quando ID = 0
        document.getElementById("error").innerHTML = html;
    } else {
        document.getElementById("ng").innerHTML = data.info.title; // nome del gioco
        document.getElementById("img").src = data.info.thumb; // immagine del gioco

        document.getElementById("pr").innerHTML = "€" + data.cheapestPriceEver.price; // prezzo più basso del gioco
        document.getElementById("stores").innerHTML = data.deals.length + " negozi che vendono il gioco"; // numero di siti che vendono il gioco
    

        var html = "";
        var html_lista_stores = "";
        const listaStore = JSON.parse(stores); // Converte l'array del JSON in una lista di oggetti JavaScript

        data.deals.forEach(store => {
            html += '<p>' + store.price + '</>'; // Prezzo del gioco per ogni store

            const storeTrovato = listaStore.find(storeTrovato => storeTrovato.storeID == store.storeID); // Trova il nome dello Store all'interno del JSON tramite il suo ID

            // Popola la lista dei negozi all'interno della pagina Dettagli
            html_lista_stores +=
           `<div>
                <p> ${storeTrovato.storeName}</p>
           </div>`

        });
        document.getElementById("stores").innerHTML = html_lista_stores; // Lista dei negozi
    }


}

// Funzione per ottenere la lista dei negozi
// Lista viene presa dal JSON che viene restituito dall'API di CheapShark
async function getStores(){
    var response = await fetch("https://www.cheapshark.com/api/1.0/stores");
    const data = await response.json();
    return data;
}