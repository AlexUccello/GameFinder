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
                html += "<div class='game' onclick=\"clickGioco("+ game.gameID + ")\">";
                html += "<img src=" + game.thumb + " class=\"thumb\">";
                html += "<a href=\"https://www.cheapshark.com/redirect?dealID=" + game.cheapestDealID + "\" class=\"title\" target=\"_blank\">" + game.external + "</a>";
                html += "<p class=\"price\">Prezzo: " + game.cheapest + "</p>";
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
    alert(id);
}

